import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Swipe from "@/models/Swipe";
import { sanitize, isValidEmail, rateLimit } from "@/lib/sanitize";

export async function POST(req: NextRequest) {
  try {
    // Rate limit: 5 registrations per IP per hour
    const ip = req.headers.get("x-forwarded-for") || "unknown";
    if (!rateLimit(`register:${ip}`, 5, 60 * 60 * 1000)) {
      return NextResponse.json({ error: "Too many attempts. Try again later." }, { status: 429 });
    }

    await dbConnect();

    const body = await req.json();
    const { email, password, displayName, fursona, age, gender, lookingFor, interests, location, bio } = body;

    // Validate required fields
    if (!email || !password || !displayName || !fursona?.name || !fursona?.species || !fursona?.fursonaType) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Validate email format
    if (!isValidEmail(email)) {
      return NextResponse.json({ error: "Invalid email format" }, { status: 400 });
    }

    // Validate password length
    if (password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 });
    }

    // Validate age
    if (!age || age < 18) {
      return NextResponse.json({ error: "Must be at least 18 years old" }, { status: 400 });
    }

    // Validate fursona type
    if (!["furry", "therian", "otherkin"].includes(fursona.fursonaType)) {
      return NextResponse.json({ error: "Invalid fursona type" }, { status: 400 });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return NextResponse.json({ error: "Email already registered" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await User.create({
      email: email.toLowerCase(),
      password: hashedPassword,
      displayName: sanitize(displayName.trim()),
      fursona: {
        name: sanitize(fursona.name.trim()),
        species: fursona.species,
        fursonaType: fursona.fursonaType,
        description: sanitize((fursona.description || "").trim()),
      },
      age,
      gender: gender || "",
      lookingFor: lookingFor || [],
      interests: interests || [],
      location: sanitize((location || "").trim()),
      bio: sanitize((bio || "").trim()),
    });

    return NextResponse.json(
      { message: "User created", userId: user._id },
      { status: 201 }
    );
  } catch (error) {
    console.error("Register error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const userId = (session.user as { id: string }).id;
    const { searchParams } = new URL(req.url);

    const species = searchParams.get("species");
    const fursonaType = searchParams.get("fursonaType");
    const minAge = searchParams.get("minAge");
    const maxAge = searchParams.get("maxAge");
    const gender = searchParams.get("gender");

    // Get users already swiped on
    const swipedUsers = await Swipe.find({ fromUser: userId }).select("toUser");
    const swipedIds = swipedUsers.map((s) => s.toUser);

    // Build filter
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const filter: any = {
      _id: { $ne: userId, $nin: swipedIds },
    };

    if (species) filter["fursona.species"] = { $regex: species, $options: "i" };
    if (fursonaType) filter["fursona.fursonaType"] = fursonaType;
    if (gender) filter.gender = gender;
    if (minAge || maxAge) {
      filter.age = {};
      if (minAge) filter.age.$gte = parseInt(minAge);
      if (maxAge) filter.age.$lte = parseInt(maxAge);
    }

    const users = await User.find(filter).limit(20).sort({ createdAt: -1 });

    return NextResponse.json(users);
  } catch (error) {
    console.error("Get users error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
