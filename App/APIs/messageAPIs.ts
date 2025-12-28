import axios from 'axios';
import { Message, InboxItem } from '@/hooks/useSocket';

// Use the API URL from environment (already includes /api/v1)
const API_BASE_URL = process.env.EXPO_PUBLIC_BACKEND_API_URL || 'http://localhost:6969/api/v1';

export interface GetMessagesParams {
  matchId: string;
  limit?: number;
  before?: string;
}

export const messageAPI = {
  // Get inbox with all matches and latest messages
  getInbox: async (token: string): Promise<InboxItem[]> => {
    try {
      const response = await axios.get(`${API_BASE_URL}/messages/inbox`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data.data;
    } catch (error) {
      // console.error('Error fetching inbox:', error);
      throw error;
    }
  },

  // Get messages for a specific match
  getMessages: async (
    token: string,
    params: GetMessagesParams
  ): Promise<Message[]> => {
    try {
      const { matchId, limit = 50, before } = params;
      const queryParams = new URLSearchParams({
        limit: limit.toString(),
        ...(before && { before }),
      });

      const response = await axios.get(
        `${API_BASE_URL}/messages/${matchId}?${queryParams}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data.data;
    } catch (error) {
      // console.error('Error fetching messages:', error);
      throw error;
    }
  },

  // Send a message (REST fallback, prefer Socket.io for real-time)
  sendMessage: async (
    token: string,
    data: {
      matchId: string;
      text: string;
      type?: 'text' | 'image' | 'gif' | 'audio';
      mediaUrl?: string;
      audioDuration?: number;
    }
  ): Promise<Message> => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/messages`,
        data,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data.data;
    } catch (error) {
      // console.error('Error sending message:', error);
      throw error;
    }
  },

  // Mark messages as read
  markAsRead: async (token: string, matchId: string): Promise<void> => {
    try {
      await axios.put(
        `${API_BASE_URL}/messages/${matchId}/read`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
    } catch (error) {
      // console.error('Error marking messages as read:', error);
      throw error;
    }
  },

  // Delete a message
  deleteMessage: async (token: string, messageId: string): Promise<void> => {
    try {
      await axios.delete(`${API_BASE_URL}/messages/${messageId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    } catch (error) {
      // console.error('Error deleting message:', error);
      throw error;
    }
  },
};

