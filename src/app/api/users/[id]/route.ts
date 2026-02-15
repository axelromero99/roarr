import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { sanitize } from "@/lib/sanitize";

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
    const user = await User.findById(id);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    return NextResponse.json(user);
  } catch (error) {
    console.error("Get user error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const userId = (session.user as { id: string }).id;
    if (userId !== id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await dbConnect();
    const body = await req.json();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const update: Record<string, any> = {};

    // Sanitize text fields
    if (body.displayName !== undefined) {
      update.displayName = sanitize(body.displayName.trim());
    }
    if (body.location !== undefined) {
      update.location = sanitize(body.location.trim());
    }
    if (body.bio !== undefined) {
      update.bio = sanitize(body.bio.trim());
    }
    if (body.fursona !== undefined) {
      update.fursona = {
        name: sanitize((body.fursona.name || "").trim()),
        species: body.fursona.species || "",
        fursonaType: body.fursona.fursonaType || "furry",
        description: sanitize((body.fursona.description || "").trim()),
      };

      if (!["furry", "therian", "otherkin"].includes(update.fursona.fursonaType)) {
        return NextResponse.json({ error: "Invalid fursona type" }, { status: 400 });
      }
    }

    // Non-text fields (no sanitization needed)
    if (body.age !== undefined) update.age = body.age;
    if (body.gender !== undefined) update.gender = body.gender;
    if (body.lookingFor !== undefined) update.lookingFor = body.lookingFor;
    if (body.interests !== undefined) update.interests = body.interests;
    if (body.avatar !== undefined) update.avatar = body.avatar;

    // Validate age if being updated
    if (update.age !== undefined && (typeof update.age !== "number" || update.age < 18)) {
      return NextResponse.json({ error: "Age must be 18 or older" }, { status: 400 });
    }

    const user = await User.findByIdAndUpdate(id, update, { new: true, runValidators: true });
    return NextResponse.json(user);
  } catch (error) {
    console.error("Update user error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
