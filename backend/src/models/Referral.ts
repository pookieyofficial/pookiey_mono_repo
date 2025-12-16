import mongoose, { Schema, Document } from "mongoose";

export interface IReferral extends Document {
    referrerUserId: string; // User who gave the referral code
    referredUserId: string; // User who used the referral code
    referralCode: string; // The referral code used
    createdAt: Date;
    updatedAt: Date;
}

const ReferralSchema = new Schema<IReferral>(
    {
        referrerUserId: {
            type: String,
            required: true,
            index: true,
        },
        referredUserId: {
            type: String,
            required: true,
            unique: true,
            index: true,
        },
        referralCode: {
            type: String,
            required: true,
            index: true,
        },
        createdAt: { type: Date, default: Date.now },
        updatedAt: { type: Date, default: Date.now },
    },
    { timestamps: true }
);

// Compound index to prevent duplicate referrals
ReferralSchema.index({ referrerUserId: 1, referredUserId: 1 }, { unique: true });

export const Referral = mongoose.model<IReferral>("Referrals", ReferralSchema);

