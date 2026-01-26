import axios from 'axios';

const BASE_URL = process.env.EXPO_PUBLIC_BACKEND_API_URL;

export const getUserAPI = BASE_URL + "/user/me";
export const createUserAPI = BASE_URL + "/user/me";
export const updateUserAPI = BASE_URL + "/user/me";
export const getRecommendedUsersAPI = BASE_URL + "/user/get-users";
export const getReferralCodeAPI = BASE_URL + "/user/referral/code";
export const validateReferralAPI = BASE_URL + "/user/referral/validate";
export const deleteAccountAPI = BASE_URL + "/user/me";

// Get user by user_id
export const getUserByIdAPI = async (userId: string, token: string) => {
    const response = await axios.get(`${BASE_URL}/user/${userId}`, {
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
    });
    return response.data;
};

// Get users who liked the current user
export const getUsersWhoLikedMeAPI = async (token: string, page: number = 1, limit: number = 20) => {
    const response = await axios.get(`${BASE_URL}/user/get-users-who-liked-me`, {
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
        params: {
            page,
            limit,
        },
    });
    return response.data;
};

// Get users who matched with the current user
export const getUserMatchesAPI = async (token: string, page: number = 1, limit: number = 20) => {
    const response = await axios.get(`${BASE_URL}/user/get-user-matches`, {
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
        params: {
            page,
            limit,
        },
    });
    return response.data;
};