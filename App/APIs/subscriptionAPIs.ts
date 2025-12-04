import axios from 'axios';

const BASE_URL = process.env.EXPO_PUBLIC_BACKEND_API_URL;

export interface SubscriptionPlan {
  id: 'free' | 'basic' | 'premium' | 'super';
  title: string;
  amountInPaise: number;
  currency: 'INR';
  durationDays: number;
  features: string[];
  interaction_per_day: number;
}

export const subscriptionAPI = {
  getPlans: async (token: string): Promise<SubscriptionPlan[]> => {
    const response = await axios.get(`${BASE_URL}/subscriptions/plans`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    return (response.data?.data ?? []) as SubscriptionPlan[];
  },
};


