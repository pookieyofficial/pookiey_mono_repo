import mongoose, { Schema, Document } from "mongoose";
import { SUBSCRIPTION_PLANS, SubscriptionPlanId } from "../config/subscriptionPlans";

export type SubscriptionStatus = "active" | "expired" | "cancelled" | "pending";

export interface ISubscription extends Document {
    userId: mongoose.Types.ObjectId;
    plan: SubscriptionPlanId;
    status: SubscriptionStatus;
    startDate: Date;
    endDate: Date;
    autoRenew: boolean;
    paymentProvider: "razorpay" | "stripe" | "paypal" | "apple" | "google";
    transactionId?: string;
    lastPaymentAt?: Date;
    metadata?: Record<string, unknown>;
    createdAt: Date;
    updatedAt: Date;
}

const SubscriptionSchema = new Schema<ISubscription>(
    {
        userId: { type: Schema.Types.ObjectId, ref: "Users", required: true, index: true },
        plan: { type: String, enum: Object.keys(SUBSCRIPTION_PLANS) as SubscriptionPlanId[], required: true, default: "free" },
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
            enum: ["razorpay", "stripe", "paypal", "apple", "google"],
            default: "razorpay",
        },
        transactionId: { type: String, index: true },
        lastPaymentAt: { type: Date },
        metadata: { type: Schema.Types.Mixed },
    },
    { timestamps: true }
);

SubscriptionSchema.index({ userId: 1, status: 1 });
SubscriptionSchema.index({ userId: 1, plan: 1, status: 1 });

export const Subscription = mongoose.model<ISubscription>(
    "Subscription",
    SubscriptionSchema
);
