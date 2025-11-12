import mongoose, { Document, Schema } from "mongoose";
import { SubscriptionPlanId } from "../config/subscriptionPlans";

export type PaymentStatus = "created" | "authorized" | "captured" | "failed" | "refunded";

export interface IPaymentTransaction extends Document {
    userId: mongoose.Types.ObjectId;
    plan: SubscriptionPlanId;
    amount: number;
    currency: string;
    status: PaymentStatus;
    razorpayOrderId: string;
    razorpayPaymentId?: string;
    razorpaySignature?: string;
    error?: {
        code?: string;
        description?: string;
        reason?: string;
        step?: string;
        metadata?: Record<string, unknown>;
    };
    metadata?: Record<string, unknown>;
    createdAt: Date;
    updatedAt: Date;
}

const PaymentTransactionSchema = new Schema<IPaymentTransaction>(
    {
        userId: { type: Schema.Types.ObjectId, ref: "Users", required: true, index: true },
        plan: { type: String, enum: ["basic", "premium", "super"], required: true },
        amount: { type: Number, required: true },
        currency: { type: String, default: "INR" },
        status: {
            type: String,
            enum: ["created", "authorized", "captured", "failed", "refunded"],
            default: "created",
        },
        razorpayOrderId: { type: String, required: true, unique: true },
        razorpayPaymentId: { type: String },
        razorpaySignature: { type: String },
        error: {
            code: String,
            description: String,
            reason: String,
            step: String,
            metadata: Schema.Types.Mixed,
        },
        metadata: { type: Schema.Types.Mixed },
    },
    { timestamps: true }
);

PaymentTransactionSchema.index({ razorpayPaymentId: 1 }, { unique: true, sparse: true });
PaymentTransactionSchema.index({ status: 1, createdAt: -1 });

export const PaymentTransaction = mongoose.model<IPaymentTransaction>(
    "PaymentTransaction",
    PaymentTransactionSchema
);

