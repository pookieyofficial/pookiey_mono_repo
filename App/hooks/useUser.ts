import { getUserAPI, createUserAPI, updateUserAPI } from "../APIs/userAPIs";
import axios from "axios";

export const useUser = () => {

    const getUser = async (idToken: string) => {
        if (!idToken) {
            return Error('No ID token');
        }
        try {
            const response = await axios.get(getUserAPI, {
                headers: {
                    Authorization: `Bearer ${idToken}`,
                },
            });
            return response.data;
        }
        catch (error: any) {
            throw error;
        }
    }

    const createUser = async (idToken: string, supabaseUser: any) => {
        if (!idToken) {
            return Error('No ID token');
        }

        try {

            if (!supabaseUser?.id) {
                throw new Error('Supabase user ID is required');
            }

            if (!supabaseUser?.email) {
                throw new Error('Email is required');
            }

            // Backend gets user_id, email, phone from verified token
            // Frontend only sends additional metadata
            const userData = {
                displayName: supabaseUser.user_metadata?.full_name || supabaseUser.email?.split('@')[0],
                photoURL: supabaseUser.user_metadata?.avatar_url,
                provider: supabaseUser.app_metadata?.provider || 'google',
            };

            const response = await axios.post(createUserAPI, userData, {
                headers: {
                    Authorization: `Bearer ${idToken}`,
                    'Content-Type': 'application/json',
                },
            });
            return response.data;
        }
        catch (error: any) {
            throw error;
        }
    }

    const getOrCreateUser = async (idToken: string, supabaseUser: any) => {
        try {
            const existingUser = await getUser(idToken);
            return existingUser;
        }
        catch (error: any) {
            const status = error?.response?.status;

            if (status === 404) {
                try {
                    const createResult = await createUser(idToken, supabaseUser);

                    if (createResult?.success) {
                        return await getUser(idToken);
                    }
                    return createResult;
                } catch (createError: any) {

                    if (createError?.response?.status === 400) {
                        try {
                            return await getUser(idToken);
                        } catch (getError) {
                            throw createError;
                        }
                    }
                    throw createError;
                }
            }
            throw error;
        }
    }

    const updateUser = async (idToken: string, userData: any) => {
        if (!idToken) {
            return Error('No ID token');
        }

        try {
            const response = await axios.patch(updateUserAPI, userData, {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${idToken}`,
                },
            });
            return response.data;
        }
        catch (error) {
            throw error;
        }
    }

    return { getUser, createUser, getOrCreateUser, updateUser };
}