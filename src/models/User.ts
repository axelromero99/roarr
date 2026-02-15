import mongoose, { Schema, Document, Model } from "mongoose";

export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  email: string;
  password: string;
  displayName: string;
  fursona: {
    name: string;
    species: string;
    fursonaType: "furry" | "therian" | "otherkin";
    description: string;
  };
  avatar: string;
  age: number;
  gender: string;
  lookingFor: string[];
  interests: string[];
  location: string;
  bio: string;
  online: boolean;
  lastSeen: Date;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true, select: false },
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

const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", UserSchema);

export default User;
