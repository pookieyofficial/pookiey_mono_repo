import axios from 'axios';

const BASE_URL = process.env.EXPO_PUBLIC_BACKEND_API_URL;

export interface Announcement {
  _id: string;
  title: string;
  htmlContent: string;
  isEnabled: boolean;
  priority?: number;
  targetAudience?: "all" | "free" | "premium" | "super";
  startDate?: Date;
  endDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Get active announcement for the current user
 */
export const getActiveAnnouncementAPI = async (token: string): Promise<Announcement | null> => {
  try {
    const response = await axios.get(`${BASE_URL}/announcements/active`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    return null;
  } catch (error: any) {
    if (error.response?.status === 404 || error.response?.status === 401) {
      return null;
    }
    throw error;
  }
};
