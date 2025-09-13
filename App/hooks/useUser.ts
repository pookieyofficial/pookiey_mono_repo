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

    const createUser = async (idToken: string, supabaseUser: any) => {
        try {
            console.log({ createUserAPI });
            console.log({ supabaseUser });

            if (!supabaseUser?.id) {
                throw new Error('Supabase user ID is required');
            }

            if (!supabaseUser?.email) {
                throw new Error('Email is required');
            }

            const userData = {
                supabase_id: supabaseUser.id,
                email: supabaseUser.email,
                phoneNumber: supabaseUser.phone,
                displayName: supabaseUser.user_metadata?.full_name || supabaseUser.email.split('@')[0],
                photoURL: supabaseUser.user_metadata?.avatar_url,
                provider: supabaseUser.app_metadata?.provider || 'email',
            };

            console.log('Creating user with data:', userData);

            const response = await axios.post(createUserAPI, userData, {
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

    const getOrCreateUser = async (idToken: string, supabaseUser: any) => {
        try {
            return await getUser(idToken);
        }
        catch (error: any) {
            const status = error?.response?.status;
            console.log('getUser failed with status:', status);
            if (status === 404) {
                console.log('User not found, creating user...');
                await createUser(idToken, supabaseUser);
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