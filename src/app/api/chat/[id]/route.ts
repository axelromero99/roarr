import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Message from "@/models/Message";
import Match from "@/models/Match";
import Notification from "@/models/Notification";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { sanitize, rateLimit } from "@/lib/sanitize";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const { id } = await params;
    const userId = (session.user as { id: string }).id;

    // Verify user belongs to this match
    const match = await Match.findOne({ _id: id, users: userId });
    if (!match) {
      return NextResponse.json({ error: "Match not found" }, { status: 404 });
    }

    const messages = await Message.find({ matchId: id })
      .populate("sender", "displayName avatar")
      .sort({ createdAt: 1 });

    // Mark messages as read
    await Message.updateMany(
      { matchId: id, sender: { $ne: userId }, read: false },
      { read: true }
    );

    return NextResponse.json(messages);
  } catch (error) {
    console.error("Get messages error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const { id } = await params;
    const userId = (session.user as { id: string }).id;

    // Verify user belongs to this match
    const match = await Match.findOne({ _id: id, users: userId });
    if (!match) {
      return NextResponse.json({ error: "Match not found" }, { status: 404 });
    }

    // Rate limit: 30 messages per user per minute
    if (!rateLimit(`chat:${userId}`, 30, 60 * 1000)) {
      return NextResponse.json({ error: "Slow down!" }, { status: 429 });
    }

    const { content } = await req.json();

    if (!content?.trim()) {
      return NextResponse.json({ error: "Empty message" }, { status: 400 });
    }

    // Limit message length
    if (content.length > 2000) {
      return NextResponse.json({ error: "Message too long" }, { status: 400 });
    }

    const sanitizedContent = sanitize(content.trim());

    const message = await Message.create({
      matchId: id,
      sender: userId,
      content: sanitizedContent,
    });

    // Update match with last message
    await Match.findByIdAndUpdate(id, {
      lastMessage: sanitizedContent,
      lastMessageAt: new Date(),
    });

    // Notify other user
    const otherUserId = match.users.find(
      (u: { toString: () => string }) => u.toString() !== userId
    );
    if (otherUserId) {
      await Notification.create({
        userId: otherUserId,
        type: "message",
        fromUser: userId,
      });
    }

    const populated = await message.populate("sender", "displayName avatar");
    return NextResponse.json(populated, { status: 201 });
  } catch (error) {
    console.error("Send message error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
