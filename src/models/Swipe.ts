import mongoose, { Schema, Document, Model } from "mongoose";

export interface ISwipe extends Document {
  fromUser: mongoose.Types.ObjectId;
  toUser: mongoose.Types.ObjectId;
  action: "like" | "dislike" | "superlike";
  createdAt: Date;
}

const SwipeSchema = new Schema<ISwipe>(
  {
    fromUser: { type: Schema.Types.ObjectId, ref: "User", required: true },
    toUser: { type: Schema.Types.ObjectId, ref: "User", required: true },
    action: {
      type: String,
      enum: ["like", "dislike", "superlike"],
      required: true,
    },
  },
  { timestamps: true }
);

SwipeSchema.index({ fromUser: 1, toUser: 1 }, { unique: true });

const Swipe: Model<ISwipe> =
  mongoose.models.Swipe || mongoose.model<ISwipe>("Swipe", SwipeSchema);

export default Swipe;
