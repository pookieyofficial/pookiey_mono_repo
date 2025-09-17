import mongoose, { Schema, Document } from "mongoose";

export interface IInteraction extends Document {
    fromUser: string;
    toUser: string;
    type: "like" | "dislike" | "superlike";
    createdAt: Date;
}

const InteractionSchema = new Schema<IInteraction>(
    {
        fromUser: { type: String, ref: "User", required: true },
        toUser: { type: String, ref: "User", required: true },
        type: { type: String, enum: ["like", "dislike", "superlike"], required: true },
    },
    { timestamps: true }
);

InteractionSchema.index({ fromUser: 1, toUser: 1 }, { unique: true });

export const Interaction = mongoose.model<IInteraction>("Interaction", InteractionSchema);
