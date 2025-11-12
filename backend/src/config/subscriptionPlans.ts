export type SubscriptionPlanId = "basic" | "premium" | "super";

export interface SubscriptionPlanConfig {
    id: SubscriptionPlanId;
    title: string;
    amountInPaise: number;
    currency: "INR";
    durationDays: number;
    features: string[];
}

export const SUBSCRIPTION_PLANS: Record<SubscriptionPlanId, SubscriptionPlanConfig> = {
    basic: {
        id: "basic",
        title: "Basic",
        amountInPaise: 49900,
        currency: "INR",
        durationDays: 30,
        features: [
            "Unlimited swipes",
            "See who liked you",
            "1 spotlight per month",
        ],
    },
    premium: {
        id: "premium",
        title: "Premium",
        amountInPaise: 89900,
        currency: "INR",
        durationDays: 90,
        features: [
            "Unlimited swipes",
            "Priority likes",
            "5 spotlights per month",
            "Advanced filters",
        ],
    },
    super: {
        id: "super",
        title: "Super",
        amountInPaise: 129900,
        currency: "INR",
        durationDays: 180,
        features: [
            "Unlimited everything",
            "Profile boost weekly",
            "See read receipts",
            "Premium support",
        ],
    },
};

export const isValidPlanId = (planId: string): planId is SubscriptionPlanId => {
    return planId === "basic" || planId === "premium" || planId === "super";
};

