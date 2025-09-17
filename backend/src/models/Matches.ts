import mongoose, { Schema, Document } from "mongoose";

export interface IMatch extends Document {
    user1Id: string;
    user2Id: string;
    status: "matched" | "unmatched" | "pending";
    initiatedBy: string;
    lastInteractionAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}

const MatchSchema = new Schema<IMatch>(
    {
        user1Id: { type: String, ref: "User", required: true },
        user2Id: { type: String, ref: "User", required: true },
        status: {
            type: String,
            enum: ["matched", "unmatched", "pending"],
            default: "pending",
        },
        initiatedBy: { type: String, ref: "User" },
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

        if (this.initiatedBy && this.initiatedBy === this.user1Id) {
            this.initiatedBy = this.user2Id;
        }
    }
    next();
});

export const Matches = mongoose.model<IMatch>("Matches", MatchSchema);
