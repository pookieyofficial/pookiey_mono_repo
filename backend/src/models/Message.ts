import mongoose, { Schema, Document } from "mongoose";

export interface IMessage extends Document {
  matchId: string;
  senderId: string;
  receiverId: string;
  content: string;
  messageType: "text" | "image" | "gif" | "video";
  deliveryStatus: "sent" | "delivered" | "read";
  isDeleted: boolean;
  deletedAt?: Date;
  editedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const MessageSchema = new Schema<IMessage>(
  {
    matchId: { type: String, ref: "Match", required: true },
    senderId: { type: String, ref: "User", required: true },
    receiverId: { type: String, ref: "User", required: true },
    content: { type: String, required: true },
    messageType: {
      type: String,
      enum: ["text", "image", "gif", "video"],
      default: "text",
    },
    deliveryStatus: {
      type: String,
      enum: ["sent", "delivered", "read"],
      default: "sent",
    },
    isDeleted: { type: Boolean, default: false },
    deletedAt: Date,
    editedAt: Date,
  },
  { timestamps: true }
);

MessageSchema.index({ matchId: 1, createdAt: 1 });

export const Message = mongoose.model<IMessage>("Message", MessageSchema);
