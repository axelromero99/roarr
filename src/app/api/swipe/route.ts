import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import dbConnect from "@/lib/mongodb";
import Swipe from "@/models/Swipe";
import Match from "@/models/Match";
import Notification from "@/models/Notification";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { rateLimit } from "@/lib/sanitize";

const VALID_ACTIONS = ["like", "dislike", "superlike"] as const;

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const userId = (session.user as { id: string }).id;

    // Rate limit: 100 swipes per user per hour
    if (!rateLimit(`swipe:${userId}`, 100, 60 * 60 * 1000)) {
      return NextResponse.json({ error: "Slow down! Too many swipes." }, { status: 429 });
    }
    const { toUser, action } = await req.json();

    if (!toUser || !action) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    // Validate action
    if (!VALID_ACTIONS.includes(action)) {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    // Prevent self-swipe
    if (toUser === userId) {
      return NextResponse.json({ error: "Cannot swipe on yourself" }, { status: 400 });
    }

    // Validate toUser is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(toUser)) {
      return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });
    }

    // Save swipe
    await Swipe.findOneAndUpdate(
      { fromUser: userId, toUser },
      { action },
      { upsert: true, new: true }
    );

    // If superlike, send notification
    if (action === "superlike") {
      await Notification.create({
        userId: toUser,
        type: "superlike",
        fromUser: userId,
      });
    }

    // Check for match (mutual like/superlike)
    if (action === "like" || action === "superlike") {
      const reciprocal = await Swipe.findOne({
        fromUser: toUser,
        toUser: userId,
        action: { $in: ["like", "superlike"] },
      });

      if (reciprocal) {
        // Check if match already exists
        const existingMatch = await Match.findOne({
          users: { $all: [userId, toUser] },
        });

        if (!existingMatch) {
          const match = await Match.create({
            users: [userId, toUser],
          });

          // Notify both users
          await Notification.insertMany([
            { userId, type: "match", fromUser: toUser },
            { userId: toUser, type: "match", fromUser: userId },
          ]);

          return NextResponse.json({ match: true, matchId: match._id });
        }
      }
    }

    return NextResponse.json({ match: false });
  } catch (error) {
    console.error("Swipe error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
