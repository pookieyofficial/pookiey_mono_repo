import mongoose, { Schema, Document } from "mongoose";

export interface IMatch extends Document {
    user1Id: mongoose.Types.ObjectId;
    user2Id: mongoose.Types.ObjectId;
    status: "pending" | "matched" | "unmatched" | "blocked";
    action: "like" | "dislike" | "superlike" | "message";
    initiatedBy: mongoose.Types.ObjectId;
    lastInteractionAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}

const MatchSchema = new Schema<IMatch>(
    {
        user1Id: { type: Schema.Types.ObjectId, ref: "User", required: true },
        user2Id: { type: Schema.Types.ObjectId, ref: "User", required: true },
        status: {
            type: String,
            enum: ["pending", "matched", "unmatched", "blocked"],
            default: "pending",
        },
        action: {
            type: String,
            enum: ["like", "dislike", "superlike", "message"],
            default: "like",
        },
        initiatedBy: { type: Schema.Types.ObjectId, ref: "User" },
        lastInteractionAt: Date,
    },
    { timestamps: true }
);

MatchSchema.index({ user1Id: 1, user2Id: 1 }, { unique: true });

MatchSchema.pre("save", function (next) {
    if (this.user1Id.toString() > this.user2Id.toString()) {
        const temp = this.user1Id;
        this.user1Id = this.user2Id;
        this.user2Id = temp;

        if (this.initiatedBy && this.initiatedBy.equals(this.user1Id)) {
            this.initiatedBy = this.user2Id;
        }
    }
    next();
});

export const Match = mongoose.model<IMatch>("Match", MatchSchema);
