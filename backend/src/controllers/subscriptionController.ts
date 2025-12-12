import { Request, Response } from "express";
import {
    SUBSCRIPTION_PLANS,
    isValidPlanId,
    SubscriptionPlanId,
} from "../config/subscriptionPlans";
import {
    createRazorpayOrder,
    getActiveSubscription,
    getPaymentHistory,
    markPaymentAsCaptured,
} from "../services/subscriptionService";
import { getRazorpayPublicKey } from "../config/razorpay";
import { ObjectId } from "mongodb";

export const getPlans = async (_req: Request, res: Response) => {
    res.json({
        success: true,
        data: Object.values(SUBSCRIPTION_PLANS),
    });
};

export const getCurrentSubscription = async (req: Request, res: Response) => {
    const user = req.user;
    if (!user?._id) {
        return res.status(404).json({ success: false, message: "User not found" });
    }

    const subscription = await getActiveSubscription(
        new ObjectId(user._id.toString()),
        user.user_id
    );

    res.json({
        success: true,
        data: subscription,
        meta: {
            subscriptionSnapshot: user.subscription ?? {
                status: "none",
            },
        },
    });
};

export const getPayments = async (req: Request, res: Response) => {
    const user = req.user;
    if (!user?._id) {
        return res.status(404).json({ success: false, message: "User not found" });
    }

    const payments = await getPaymentHistory(new ObjectId(user._id.toString()));

    res.json({
        success: true,
        data: payments,
    });
};

export const createOrder = async (req: Request, res: Response) => {
    try {
        const planId = req.body.planId as string;
        if (!planId || !isValidPlanId(planId)) {
            return res.status(400).json({ success: false, message: "Invalid plan" });
        }

        const user = req.user;
        if (!user) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }

        const { order, plan } = await createRazorpayOrder({
            planId: planId as SubscriptionPlanId,
            userId: user.user_id,
        });

        res.json({
            success: true,
            data: {
                order,
                plan,
                razorpayKey: getRazorpayPublicKey(),
            },
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error instanceof Error ? error.message : "Failed to create order",
        });
    }
};

export const verifyOrder = async (req: Request, res: Response) => {
    try {
        const {
            razorpay_order_id: razorpayOrderId,
            razorpay_payment_id: razorpayPaymentId,
            razorpay_signature: razorpaySignature,
        } = req.body;

        if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
            return res.status(400).json({
                success: false,
                message: "Missing Razorpay payment details",
            });
        }

        const user = req.user;
        if (!user) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }

        const result = await markPaymentAsCaptured({
            userId: user.user_id,
            razorpayOrderId,
            razorpayPaymentId,
            razorpaySignature,
        });

        res.json({
            success: true,
            data: {
                payment: result.payment,
                subscription: result.subscription,
                plan: result.plan,
            },
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error instanceof Error ? error.message : "Payment verification failed",
        });
    }
};

