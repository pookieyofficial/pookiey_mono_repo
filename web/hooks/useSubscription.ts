"use client";

import useSWR from "swr";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { callBackend } from "../lib/api";

export interface SubscriptionPlan {
  id: "basic" | "premium" | "super";
  title: string;
  amountInPaise: number;
  currency: "INR";
  durationDays: number;
  features: string[];
}

interface SubscriptionResponse {
  _id: string;
  plan: string;
  status: string;
  startDate: string;
  endDate: string;
  autoRenew: boolean;
}

interface PaymentHistoryItem {
  _id: string;
  plan: string;
  status: string;
  amount: number;
  currency: string;
  createdAt: string;
}

interface SubscriptionSnapshot {
  status: "none" | "pending" | "active" | "expired" | "cancelled";
  plan?: SubscriptionPlan["id"] | null;
  startDate?: string | null;
  endDate?: string | null;
  autoRenew?: boolean;
  lastPaymentAt?: string | null;
  provider?: "razorpay" | "stripe" | "paypal" | "apple" | "google" | null;
}

export interface CurrentSubscriptionData {
  subscription: SubscriptionResponse | null;
  snapshot: SubscriptionSnapshot | null;
}

export function useSubscriptionData(enabled: boolean) {
  const supabase = useSupabaseClient();

  const plans = useSWR(enabled ? "/api/v1/subscriptions/plans" : null, async () => {
    const response = await callBackend<SubscriptionPlan[]>(
      supabase,
      "/api/v1/subscriptions/plans"
    );
    return response.data ?? [];
  });

  const current = useSWR(
    enabled ? "/api/v1/subscriptions/current" : null,
    async () => {
      const response = await callBackend<SubscriptionResponse | null>(
        supabase,
        "/api/v1/subscriptions/current"
      );

      const snapshot = (response.meta as { subscriptionSnapshot?: SubscriptionSnapshot } | undefined)
        ?.subscriptionSnapshot ?? null;

      return {
        subscription: response.data ?? null,
        snapshot,
      } satisfies CurrentSubscriptionData;
    }
  );

  const payments = useSWR(
    enabled ? "/api/v1/subscriptions/payments" : null,
    async () => {
      const response = await callBackend<PaymentHistoryItem[]>(
        supabase,
        "/api/v1/subscriptions/payments"
      );
      return response.data ?? [];
    }
  );

  return {
    plans,
    current,
    payments,
  };
}

