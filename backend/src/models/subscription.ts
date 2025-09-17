import mongoose, { Schema, Document } from "mongoose";

export interface ISubscription extends Document {
    userId: mongoose.Types.ObjectId;
    plan: "silver" | "gold" | "diamond";
    status: "active" | "expired" | "cancelled" | "pending";
    startDate: Date;
    endDate: Date;
    autoRenew: boolean;
    paymentProvider: "stripe" | "razorpay" | "paypal" | "apple" | "google";
    transactionId?: string;
    createdAt: Date;
    updatedAt: Date;
}

const SubscriptionSchema = new Schema<ISubscription>(
    {
        userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
        plan: { type: String, enum: ["silver", "gold", "diamond"], required: true },
        status: {
            type: String,
            enum: ["active", "expired", "cancelled", "pending"],
            default: "pending",
        },
        startDate: { type: Date, default: Date.now },
        endDate: { type: Date, required: true },
        autoRenew: { type: Boolean, default: true },
        paymentProvider: {
            type: String,
            enum: ["stripe", "razorpay", "paypal", "apple", "google"],
            required: true,
        },
        transactionId: { type: String, index: true },
    },
    { timestamps: true }
);

export const Subscription = mongoose.model<ISubscription>(
    "Subscription",
    SubscriptionSchema
);
