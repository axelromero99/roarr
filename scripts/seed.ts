import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/roarr";

// Import schema definition inline to avoid path alias issues with ts-node
const UserSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    displayName: { type: String, required: true },
    fursona: {
      name: { type: String, required: true },
      species: { type: String, required: true },
      fursonaType: {
        type: String,
        enum: ["furry", "therian", "otherkin"],
        required: true,
      },
      description: { type: String, default: "" },
    },
    avatar: { type: String, default: "/avatars/default.svg" },
    age: { type: Number, required: true, min: 18 },
    gender: { type: String, required: true },
    lookingFor: [{ type: String }],
    interests: [{ type: String }],
    location: { type: String, default: "" },
    bio: { type: String, default: "" },
    online: { type: Boolean, default: false },
    lastSeen: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const User = mongoose.models.User || mongoose.model("User", UserSchema);

const seedUsers = [
  {
    email: "luna@roarr.com",
    password: "password123",
    displayName: "LunaWolf",
    fursona: {
      name: "Luna",
      species: "Wolf",
      fursonaType: "therian",
      description: "A silver wolf with bright blue eyes and a crescent moon marking on her forehead. She loves howling at the moon and exploring forests.",
    },
    age: 22,
    gender: "Female",
    lookingFor: ["Dating", "Friends"],
    interests: ["Art", "Hiking", "Music", "Nature"],
    location: "Portland, OR",
    bio: "Night owl and forest explorer. I feel most alive under the moonlight. Looking for someone who understands the call of the wild.",
    online: true,
  },
  {
    email: "blaze@roarr.com",
    password: "password123",
    displayName: "BlazeFox",
    fursona: {
      name: "Blaze",
      species: "Fox",
      fursonaType: "furry",
      description: "A fiery red fox with orange-tipped ears and a fluffy tail. Always wearing a leather jacket and has a mischievous grin.",
    },
    age: 25,
    gender: "Male",
    lookingFor: ["Dating", "Relationship"],
    interests: ["Gaming", "Music", "Cosplay", "Technology"],
    location: "Seattle, WA",
    bio: "Gamer fox with a passion for EDM and fursuiting. Let's go to a con together!",
    online: true,
  },
  {
    email: "aurora@roarr.com",
    password: "password123",
    displayName: "AuroraScale",
    fursona: {
      name: "Aurora",
      species: "Dragon",
      fursonaType: "otherkin",
      description: "An iridescent dragon with shimmering scales that change color with her mood. Wings like stained glass and eyes like amethysts.",
    },
    age: 28,
    gender: "Female",
    lookingFor: ["Friends", "Relationship"],
    interests: ["Art", "Writing", "Anime", "Crafting"],
    location: "Denver, CO",
    bio: "Artist dragon who hoards art supplies instead of gold. I'll draw your fursona if you're nice to me.",
    online: false,
  },
  {
    email: "shadow@roarr.com",
    password: "password123",
    displayName: "ShadowPaw",
    fursona: {
      name: "Shadow",
      species: "Cat",
      fursonaType: "therian",
      description: "A sleek black cat with glowing green eyes. Silent as the night, graceful as the wind. Has a tiny white star on his chest.",
    },
    age: 20,
    gender: "Non-binary",
    lookingFor: ["Friends", "Chat Buddy"],
    interests: ["Gaming", "Anime", "Music", "Photography"],
    location: "Austin, TX",
    bio: "Nocturnal by nature. I purr when I'm happy and hiss when I'm annoyed. Currently looking for a cozy lap to nap on.",
    online: true,
  },
  {
    email: "storm@roarr.com",
    password: "password123",
    displayName: "StormRunner",
    fursona: {
      name: "Storm",
      species: "Horse",
      fursonaType: "therian",
      description: "A wild mustang with a dark grey coat and lightning-bolt shaped blaze. Untamed mane that flows like thunder clouds.",
    },
    age: 26,
    gender: "Male",
    lookingFor: ["Dating", "Relationship"],
    interests: ["Hiking", "Nature", "Photography", "Cooking"],
    location: "Montana",
    bio: "Free spirit who loves open spaces. I run with the wind and sleep under the stars. Ranch life is the best life.",
    online: false,
  },
  {
    email: "pixel@roarr.com",
    password: "password123",
    displayName: "PixelBun",
    fursona: {
      name: "Pixel",
      species: "Rabbit",
      fursonaType: "furry",
      description: "A cute white bunny with pastel pink inner ears and a pixel-heart pattern on her tail. Always wearing oversized headphones.",
    },
    age: 21,
    gender: "Female",
    lookingFor: ["Friends", "Dating"],
    interests: ["Gaming", "Art", "Music", "Cosplay"],
    location: "Tokyo, Japan",
    bio: "Hop hop! Retro gaming enthusiast and digital artist. I make cute stickers and keychains. Let's play some co-op games!",
    online: true,
  },
  {
    email: "fang@roarr.com",
    password: "password123",
    displayName: "FangBite",
    fursona: {
      name: "Fang",
      species: "Shark",
      fursonaType: "furry",
      description: "A hammerhead shark with cyberpunk-style bioluminescent markings. Has a mechanical left arm and wears neon goggles.",
    },
    age: 24,
    gender: "Male",
    lookingFor: ["Friends", "Chat Buddy"],
    interests: ["Technology", "Gaming", "Music", "Movies"],
    location: "Miami, FL",
    bio: "Cyberpunk shark navigating the digital ocean. I build PCs and collect vintage synths. Byte me!",
    online: false,
  },
  {
    email: "willow@roarr.com",
    password: "password123",
    displayName: "WillowDoe",
    fursona: {
      name: "Willow",
      species: "Deer",
      fursonaType: "therian",
      description: "A gentle white-tailed deer with flower crowns woven into her antlers. Soft brown eyes and a dappled coat covered in tiny wildflowers.",
    },
    age: 23,
    gender: "Female",
    lookingFor: ["Relationship", "Friends"],
    interests: ["Nature", "Art", "Cooking", "Photography"],
    location: "Vermont",
    bio: "Quiet soul who finds peace in nature. I make pressed flower art and bake sourdough bread. Looking for someone gentle and kind.",
    online: true,
  },
  {
    email: "ember@roarr.com",
    password: "password123",
    displayName: "EmberClaw",
    fursona: {
      name: "Ember",
      species: "Bear",
      fursonaType: "furry",
      description: "A massive grizzly bear with ember-like orange markings. Wears a flannel shirt and always has honey somewhere nearby.",
    },
    age: 30,
    gender: "Male",
    lookingFor: ["Dating", "Relationship"],
    interests: ["Cooking", "Hiking", "Movies", "Crafting"],
    location: "Vancouver, BC",
    bio: "Big bear with a bigger heart. I'll cook you breakfast and give the best bear hugs. Lumberjack aesthetic enthusiast.",
    online: false,
  },
  {
    email: "nyx@roarr.com",
    password: "password123",
    displayName: "NyxWing",
    fursona: {
      name: "Nyx",
      species: "Bat",
      fursonaType: "otherkin",
      description: "A fruit bat with galaxy-patterned wings and starlight freckles. Hangs upside down to think and has the cutest fangs.",
    },
    age: 19,
    gender: "Non-binary",
    lookingFor: ["Friends", "Chat Buddy"],
    interests: ["Music", "Anime", "Writing", "Conventions"],
    location: "London, UK",
    bio: "Nocturnal creature of the night sky. I write dark fantasy and listen to too much goth music. Bats are just sky puppies!",
    online: true,
  },
  {
    email: "copper@roarr.com",
    password: "password123",
    displayName: "CopperTail",
    fursona: {
      name: "Copper",
      species: "Raccoon",
      fursonaType: "furry",
      description: "A trash panda with copper-colored rings and a tiny top hat. Has pockets full of shiny things and a contagious laugh.",
    },
    age: 27,
    gender: "Male",
    lookingFor: ["Friends", "Dating"],
    interests: ["Gaming", "Cosplay", "Movies", "Conventions"],
    location: "Chicago, IL",
    bio: "Professional trash panda. I collect shiny things and bad jokes. Will trade snacks for friendship. Conventions are my natural habitat.",
    online: true,
  },
  {
    email: "sage@roarr.com",
    password: "password123",
    displayName: "SageOtter",
    fursona: {
      name: "Sage",
      species: "Otter",
      fursonaType: "therian",
      description: "A playful sea otter with sage-green eyes and a shell collection. Always floating on her back and cracking jokes.",
    },
    age: 22,
    gender: "Female",
    lookingFor: ["Dating", "Friends"],
    interests: ["Nature", "Photography", "Cooking", "Dancing"],
    location: "San Diego, CA",
    bio: "Otterly adorable and I know it. Beach lover, sunset chaser, and professional belly floater. Hold my hand while we float?",
    online: false,
  },
];

async function seed() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB");

    // Clear existing data
    await User.deleteMany({});
    console.log("Cleared existing users");

    // Create users with hashed passwords
    for (const userData of seedUsers) {
      const hashedPassword = await bcrypt.hash(userData.password, 12);
      await User.create({ ...userData, password: hashedPassword });
      console.log(`  Created: ${userData.displayName} (${userData.email})`);
    }

    console.log(`\n${seedUsers.length} users seeded successfully!`);
    console.log("\nLogin credentials:");
    console.log("  Password for all accounts: password123");
    console.log("  Example: luna@roarr.com / password123");

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error("Seed error:", error);
    process.exit(1);
  }
}

seed();
