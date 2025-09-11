import { getUserAPI, createUserAPI, updateUserAPI } from "../APIs/userAPIs";
import axios from "axios";

export const useUser = () => {

    const getUser = async (idToken: string) => {
        if (!idToken) {
            return Error('No ID token');
        }
        try {
            console.log({ getUserAPI });
            console.log(12345)
            const response = await axios.get(getUserAPI, {
                headers: {
                    Authorization: `Bearer ${idToken}`,
                    'Content-Type': 'application/json',
                },
            });
            console.log(67890)

            console.log({ response });
            return response.data;
        }
        catch (error) {
            console.error('Error getting user:', error);
            throw error;
        }
    }

    const createUser = async (idToken: string, uid: string, phoneNumber: string) => {
        try {
            console.log({ createUserAPI });
            console.log({ uid });
            const response = await axios.post(createUserAPI, { uid, phoneNumber }, {
                headers: {
                    Authorization: `Bearer ${idToken}`,
                    'Content-Type': 'application/json',
                },
            });
            return response.data;
        }
        catch (error) {
            console.error('Error creating user:', error);
            throw error;
        }
    }

    const getOrCreateUser = async (idToken: string, uid: string, phoneNumber: string) => {
        try {
            return await getUser(idToken);
        }
        catch (error: any) {
            const status = error?.response?.status;
            if (status === 401 || status === 404) {
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