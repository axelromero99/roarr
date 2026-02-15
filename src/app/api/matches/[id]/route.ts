import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Match from "@/models/Match";
import Message from "@/models/Message";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function DELETE(
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

    // Delete all messages in this match
    await Message.deleteMany({ matchId: id });

    // Delete the match
    await Match.findByIdAndDelete(id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Unmatch error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
