import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Match from "@/models/Match";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const userId = (session.user as { id: string }).id;

    const matches = await Match.find({ users: userId })
      .populate("users", "displayName avatar fursona online lastSeen")
      .sort({ lastMessageAt: -1 });

    return NextResponse.json(matches);
  } catch (error) {
    console.error("Get matches error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
