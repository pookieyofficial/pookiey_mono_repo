import { getUserAPI, createUserAPI, updateUserAPI } from "../APIs/userAPIs";
import axios from "axios";

export const useUser = () => {

    const getUser = async (idToken: string) => {
        if (!idToken) {
            return Error('No ID token');
        }
        try {
            console.log('getUserAPI URL:', getUserAPI);
            console.log('Calling getUser with token:', idToken.substring(0, 20) + '...');
            const response = await axios.get(getUserAPI, {
                headers: {
                    Authorization: `Bearer ${idToken}`,
                },
            });
            console.log('getUser success:', response.data);
            return response.data;
        }
        catch (error: any) {
            console.error('Error getting user:', error);
            console.error('Error status:', error?.response?.status);
            console.error('Error data:', error?.response?.data);
            throw error;
        }
    }

    const createUser = async (idToken: string, uid: string, phoneNumber: string) => {
        try {
            console.log({ createUserAPI });
            console.log({ uid, phoneNumber });

            if (!phoneNumber || phoneNumber.trim() === '') {
                throw new Error('Phone number is required');
            }

            const response = await axios.post(createUserAPI, { uid, phoneNumber }, {
                headers: {
                    Authorization: `Bearer ${idToken}`,
                    'Content-Type': 'application/json',
                },
            });
            return response.data;
        }
        catch (error: any) {
            console.error('Error creating user:', error);
            if (error.response) {
                console.error('Response data:', error.response.data);
                console.error('Response status:', error.response.status);
            }
            throw error;
        }
    }

    const getOrCreateUser = async (idToken: string, uid: string, phoneNumber: string) => {
        try {
            return await getUser(idToken);
        }
        catch (error: any) {
            const status = error?.response?.status;
            console.log('getUser failed with status:', status);
            if (status === 404) {
                console.log('User not found, creating user...');
                await createUser(idToken, uid, phoneNumber);
                return await getUser(idToken);
            }
            throw error;
        }
    }

    const updateUser = async (idToken: string, userData: any) => {
        try {
            console.log({ updateUserAPI });
            console.log({ userData });
            const response = await axios.patch(updateUserAPI, userData, {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${idToken}`,
                },
            });
            return response.data;
        }
        catch (error) {
            console.error('Error updating user:', error);
            throw error;
        }
    }

    return { getUser, createUser, getOrCreateUser, updateUser };
}