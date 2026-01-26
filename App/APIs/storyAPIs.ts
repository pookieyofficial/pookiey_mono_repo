import axios from 'axios';

const BASE_URL = process.env.EXPO_PUBLIC_BACKEND_API_URL;

export const storyAPI = {
    // Get all stories from matched users with pagination
    getStories: async (token: string, friendsPage?: number, friendsLimit?: number, discoverPage?: number, discoverLimit?: number) => {
        const params = new URLSearchParams();
        if (friendsPage) params.append('friendsPage', friendsPage.toString());
        if (friendsLimit) params.append('friendsLimit', friendsLimit.toString());
        if (discoverPage) params.append('discoverPage', discoverPage.toString());
        if (discoverLimit) params.append('discoverLimit', discoverLimit.toString());
        
        const url = `${BASE_URL}/stories${params.toString() ? `?${params.toString()}` : ''}`;
        const response = await axios.get(url, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });
        console.log('Story API Response:', response.data);
        return response.data.data || {};
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

    // Like/Unlike a story
    likeStory: async (storyId: string, token: string) => {
        const response = await axios.post(`${BASE_URL}/stories/${storyId}/like`, {}, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });
        return response.data.data;
    },

    // Get viewers of a story (only for own stories)
    getStoryViewers: async (storyId: string, token: string) => {
        const response = await axios.get(`${BASE_URL}/stories/${storyId}/viewers`, {
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

