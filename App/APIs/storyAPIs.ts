import axios from 'axios';

const BASE_URL = process.env.EXPO_PUBLIC_BACKEND_API_URL;

export const storyAPI = {
    // Get all stories from matched users
    getStories: async (token: string) => {
        const response = await axios.get(`${BASE_URL}/stories`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });
        console.log('Story API Response:', response.data);
        return response.data.data || [];
    },

    // Create a new story
    createStory: async (storyData: {
        type: 'image' | 'video';
        mediaUrl: string;
    }, token: string) => {
        const response = await axios.post(`${BASE_URL}/stories`, storyData, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });
        return response.data.data;
    },

    // Mark story as viewed
    viewStory: async (storyId: string, token: string) => {
        const response = await axios.post(`${BASE_URL}/stories/${storyId}/view`, {}, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });
        return response.data.data;
    },

    // Delete a story
    deleteStory: async (storyId: string, token: string) => {
        const response = await axios.delete(`${BASE_URL}/stories/${storyId}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });
        return response.data;
    },
};

