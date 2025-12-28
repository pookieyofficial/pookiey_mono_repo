import axios from 'axios';

const BASE_URL = process.env.EXPO_PUBLIC_BACKEND_API_URL;

// Log the BASE_URL to see what's being used
// console.log('🔍 [userAPIs.ts] BASE_URL:', BASE_URL);
// console.log('🔍 [userAPIs.ts] EXPO_PUBLIC_BACKEND_API_URL env:', process.env.EXPO_PUBLIC_BACKEND_API_URL);

export const getUserAPI = BASE_URL + "/user/me";
export const createUserAPI = BASE_URL + "/user/me";
export const updateUserAPI = BASE_URL + "/user/me";
export const getRecommendedUsersAPI = BASE_URL + "/user/get-users";
export const getReferralCodeAPI = BASE_URL + "/user/referral/code";
export const validateReferralAPI = BASE_URL + "/user/referral/validate";
export const deleteAccountAPI = BASE_URL + "/user/me";

// Log the constructed URLs
// console.log('🔍 [userAPIs.ts] getUserAPI:', getUserAPI);
// console.log('🔍 [userAPIs.ts] createUserAPI:', createUserAPI);

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