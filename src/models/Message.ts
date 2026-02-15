import mongoose, { Schema, Document, Model } from "mongoose";

export interface IMessage extends Document {
  matchId: mongoose.Types.ObjectId;
  sender: mongoose.Types.ObjectId;
  content: string;
  read: boolean;
  createdAt: Date;
}

const MessageSchema = new Schema<IMessage>(
  {
    matchId: { type: Schema.Types.ObjectId, ref: "Match", required: true },
    sender: { type: Schema.Types.ObjectId, ref: "User", required: true },
    content: { type: String, required: true },
    read: { type: Boolean, default: false },
  },
  { timestamps: true }
);

MessageSchema.index({ matchId: 1, createdAt: 1 });

const Message: Model<IMessage> =
  mongoose.models.Message ||
  mongoose.model<IMessage>("Message", MessageSchema);

export default Message;
