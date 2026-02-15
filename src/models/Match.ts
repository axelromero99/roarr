import mongoose, { Schema, Document, Model } from "mongoose";

export interface IMatch extends Document {
  users: mongoose.Types.ObjectId[];
  lastMessage: string;
  lastMessageAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const MatchSchema = new Schema<IMatch>(
  {
    users: [{ type: Schema.Types.ObjectId, ref: "User", required: true }],
    lastMessage: { type: String, default: "" },
    lastMessageAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

MatchSchema.index({ users: 1 });

const Match: Model<IMatch> =
  mongoose.models.Match || mongoose.model<IMatch>("Match", MatchSchema);

export default Match;
