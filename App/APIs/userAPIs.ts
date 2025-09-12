const BASE_URL = process.env.EXPO_PUBLIC_BACKEND_API_URL || "http://192.168.1.5:6969";
console.log('Backend API URL:', BASE_URL);

export const getUserAPI = BASE_URL + "/api/v1/user/me";
export const createUserAPI = BASE_URL + "/api/v1/user/me";
export const updateUserAPI = BASE_URL + "/api/v1/user/me";