import axios from 'axios';

const BASE_URL = process.env.EXPO_PUBLIC_BACKEND_API_URL;
export const getUserAPI = BASE_URL + "/user/me";
export const createUserAPI = BASE_URL + "/user/me";
export const updateUserAPI = BASE_URL + "/user/me";
export const getRecommendedUsersAPI = BASE_URL + "/user/get-users";

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