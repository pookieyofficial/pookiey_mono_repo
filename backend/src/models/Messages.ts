import mongoose, { Schema, Document } from "mongoose";

export interface IMessage extends Document {
    matchId: mongoose.Types.ObjectId;
    senderId: string;
    receiverId: string;
    text: string;
    type: "text" | "image" | "gif";
    mediaUrl?: string;
    isRead: boolean;
    readAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}

const MessageSchema = new Schema<IMessage>(
    {
        matchId: { 
            type: Schema.Types.ObjectId, 
            ref: "Matches", 
            required: true,
            index: true 
        },
        senderId: { 
            type: String, 
            ref: "Users", 
            required: true,
            index: true 
        },
        receiverId: { 
            type: String, 
            ref: "Users", 
            required: true,
            index: true 
        },
        text: { type: String, required: true },
        type: { 
            type: String, 
            enum: ["text", "image", "gif"], 
            default: "text" 
        },
        mediaUrl: { type: String },
        isRead: { type: Boolean, default: false },
        readAt: { type: Date },
    },
    { timestamps: true }
);

// Compound index for efficient querying
MessageSchema.index({ matchId: 1, createdAt: -1 });
MessageSchema.index({ senderId: 1, createdAt: -1 });
MessageSchema.index({ receiverId: 1, isRead: 1 });

export const Messages = mongoose.model<IMessage>("Messages", MessageSchema);

