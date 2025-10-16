import { useState } from 'react';
import { useAuth } from './useAuth';

const BASE_URL = process.env.EXPO_PUBLIC_BACKEND_API_URL;

export interface InteractionResponse {
  success: boolean;
  data?: any;
  match?: any;
  isMatch: boolean;
  message?: string;
  user1?: {
    user_id: string;
    displayName?: string;
    photoURL?: string;
    profile?: {
      firstName?: string;
      photos?: Array<{ url: string; isPrimary?: boolean }>;
    };
  };
  user2?: {
    user_id: string;
    displayName?: string;
    photoURL?: string;
    profile?: {
      firstName?: string;
      photos?: Array<{ url: string; isPrimary?: boolean }>;
    };
  };
}

export interface InteractionParams {
  toUser: string;
  type: 'like' | 'dislike' | 'superlike';
}

export const useUserInteraction = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { getIdToken } = useAuth();

  const createInteraction = async ({ toUser, type }: InteractionParams): Promise<InteractionResponse> => {
    setIsLoading(true);
    setError(null);

    try {
      const token = await getIdToken();
      if (!token) {
        throw new Error('Authentication token not found');
      }

      const response = await fetch(`${BASE_URL}/interaction?toUser=${toUser}&type=${type}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Interaction failed');
      }

      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      return {
        success: false,
        isMatch: false,
        message: errorMessage,
      };
    } finally {
      setIsLoading(false);
    }
  };

  const likeUser = async (toUser: string) => {
    return createInteraction({ toUser, type: 'like' });
  };

  const dislikeUser = async (toUser: string) => {
    return createInteraction({ toUser, type: 'dislike' });
  };

  const superlikeUser = async (toUser: string) => {
    return createInteraction({ toUser, type: 'superlike' });
  };

  return {
    isLoading,
    error,
    likeUser,
    dislikeUser,
    superlikeUser,
    createInteraction,
  };
};
