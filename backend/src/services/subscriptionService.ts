import crypto from "crypto";
import { Types } from "mongoose";
import { PaymentTransaction, Subscription, User } from "../models";
import { razorpayClient } from "../config/razorpay";
import {
    SUBSCRIPTION_PLANS,
    SubscriptionPlanConfig,
    SubscriptionPlanId,
} from "../config/subscriptionPlans";
import { SubscriptionStatus } from "../models/subscription";

interface CreateOrderParams {
    userId: string;
    planId: SubscriptionPlanId;
}

type UserSubscriptionStatus = SubscriptionStatus | "none";

const updateUserSubscriptionSnapshot = async (
    userMongoId: Types.ObjectId,
    payload: {
        status: UserSubscriptionStatus;
        plan?: SubscriptionPlanId | null;
        startDate?: Date | null;
        endDate?: Date | null;
        autoRenew?: boolean;
        lastPaymentAt?: Date | null;
        provider?: "razorpay" | "stripe" | "paypal" | "apple" | "google" | null;
    }
) => {
    await User.updateOne(
        { _id: userMongoId },
        {
            $set: {
                "subscription.status": payload.status,
                "subscription.plan": payload.plan ?? null,
                "subscription.startDate": payload.startDate ?? null,
                "subscription.endDate": payload.endDate ?? null,
                "subscription.autoRenew": payload.autoRenew ?? true,
                "subscription.lastPaymentAt": payload.lastPaymentAt ?? null,
                "subscription.provider": payload.provider ?? null,
                "subscription.updatedAt": new Date(),
            },
        }
    );
};

export const getPlanConfig = (planId: SubscriptionPlanId): SubscriptionPlanConfig => {
    return SUBSCRIPTION_PLANS[planId];
};

export const createRazorpayOrder = async ({
    userId,
    planId,
}: CreateOrderParams) => {
    const plan = getPlanConfig(planId);

    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
        throw new Error("Razorpay keys are not configured on the server.");
    }

    const user = await User.findOne({ user_id: userId });
    if (!user) {
        throw new Error("User not found");
    }

    const userObjectId = (user._id as Types.ObjectId).toString();
    const sanitizedUserId =
        userId.replace(/[^a-zA-Z0-9]/g, "").slice(-16) || userObjectId.slice(-16);
    const timestampFragment = Date.now().toString().slice(-10);
    const receipt = `rcpt_${sanitizedUserId}_${timestampFragment}`.slice(0, 40);

    let order;
    try {
        order = await razorpayClient.orders.create({
            amount: plan.amountInPaise,
            currency: plan.currency,
            receipt,
            notes: {
                planId,
                userId,
            },
        });
    } catch (error: any) {
        const message =
            error?.error?.description ||
            error?.message ||
            "Unknown Razorpay error";
        throw new Error(`Razorpay order creation failed: ${message}`);
    }

    try {
        await PaymentTransaction.create({
            userId: user._id,
            plan: planId,
            amount: plan.amountInPaise,
            currency: plan.currency,
            razorpayOrderId: order.id,
            status: "created",
            metadata: {
                receipt: order.receipt,
            },
        });
    } catch (error: any) {
        const message = error?.message || "Failed to persist payment record";
        throw new Error(`Payment record creation failed: ${message}`);
    }

    await updateUserSubscriptionSnapshot(user._id as Types.ObjectId, {
        status: "pending",
        plan: planId,
        autoRenew: true,
        provider: "razorpay",
    });

    return {
        order,
        plan,
    };
};

interface VerifyPaymentParams {
    userId: string;
    razorpayOrderId: string;
    razorpayPaymentId: string;
    razorpaySignature: string;
}

export const verifyPaymentSignature = ({
    razorpayOrderId,
    razorpayPaymentId,
    razorpaySignature,
}: Omit<VerifyPaymentParams, "userId">) => {
    const keySecret = process.env.RAZORPAY_KEY_SECRET ?? "";
    const generatedSignature = crypto
        .createHmac("sha256", keySecret)
        .update(`${razorpayOrderId}|${razorpayPaymentId}`)
        .digest("hex");

    return generatedSignature === razorpaySignature;
};

export const markPaymentAsCaptured = async ({
    userId,
    razorpayOrderId,
    razorpayPaymentId,
    razorpaySignature,
}: VerifyPaymentParams) => {
    const payment = await PaymentTransaction.findOne({ razorpayOrderId });
    if (!payment) {
        throw new Error("Payment record not found");
    }

    if (!verifyPaymentSignature({ razorpayOrderId, razorpayPaymentId, razorpaySignature })) {
        await payment.updateOne({
            status: "failed",
            razorpayPaymentId,
            razorpaySignature,
            error: {
                reason: "signature_mismatch",
            },
        });
        throw new Error("Invalid payment signature");
    }

    payment.razorpayPaymentId = razorpayPaymentId;
    payment.razorpaySignature = razorpaySignature;
    payment.status = "captured";
    await payment.save();

    const planConfig = getPlanConfig(payment.plan);
    const user = await User.findOne({ user_id: userId });
    if (!user) {
        throw new Error("User not found");
    }

    const subscription = await Subscription.findOne({ userId: user._id });
    const startDate = new Date();

    const endDate = subscription && subscription.status === "active" && subscription.endDate > new Date()
        ? new Date(subscription.endDate.getTime() + planConfig.durationDays * 24 * 60 * 60 * 1000)
        : new Date(startDate.getTime() + planConfig.durationDays * 24 * 60 * 60 * 1000);

    const updatedSubscription = await Subscription.findOneAndUpdate(
        { userId: user._id },
        {
            plan: payment.plan,
            status: "active",
            startDate,
            endDate,
            autoRenew: true,
            paymentProvider: "razorpay",
            transactionId: razorpayPaymentId,
            lastPaymentAt: new Date(),
            metadata: {
                planTitle: planConfig.title,
                amountInPaise: planConfig.amountInPaise,
            },
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    await updateUserSubscriptionSnapshot(user._id as Types.ObjectId, {
        status: "active",
        plan: payment.plan,
        startDate,
        endDate,
        autoRenew: true,
        lastPaymentAt: new Date(),
        provider: "razorpay",
    });

    return {
        payment,
        subscription: updatedSubscription,
        plan: planConfig,
    };
};

export const getActiveSubscription = async (userMongoId: Types.ObjectId) => {
    const user = await User.findById(userMongoId).select("subscription");

    const subscription = await Subscription.findOne({
        userId: userMongoId,
        status: "active",
    }).sort({ updatedAt: -1 });

    if (!subscription) {
        if (user?.subscription?.status !== "pending") {
            await updateUserSubscriptionSnapshot(userMongoId, {
                status: "none",
                plan: null,
                startDate: null,
                endDate: null,
                autoRenew: true,
                lastPaymentAt: null,
                provider: null,
            });
        }
        return null;
    }

    if (subscription.endDate < new Date()) {
        subscription.status = "expired";
        await subscription.save();
        await updateUserSubscriptionSnapshot(userMongoId, {
            status: "expired",
            plan: subscription.plan,
            startDate: subscription.startDate,
            endDate: subscription.endDate,
            autoRenew: subscription.autoRenew,
            lastPaymentAt: subscription.lastPaymentAt ?? null,
            provider: subscription.paymentProvider,
        });
        return null;
    }

    await updateUserSubscriptionSnapshot(userMongoId, {
        status: "active",
        plan: subscription.plan,
        startDate: subscription.startDate,
        endDate: subscription.endDate,
        autoRenew: subscription.autoRenew,
        lastPaymentAt: subscription.lastPaymentAt ?? null,
        provider: subscription.paymentProvider,
    });

    return subscription;
};

export const getPaymentHistory = async (userMongoId: Types.ObjectId) => {
    return PaymentTransaction.find({ userId: userMongoId })
        .sort({ createdAt: -1 })
        .limit(20);
};

