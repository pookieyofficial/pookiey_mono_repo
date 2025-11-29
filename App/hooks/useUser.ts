import { getUserAPI, createUserAPI, updateUserAPI, getRecommendedUsersAPI } from "../APIs/userAPIs";
import axios from "axios";

export const useUser = () => {

    const getUser = async (idToken: string) => {
        if (!idToken) {
            return Error('No ID token');
        }
        try {
            console.log('🚀 [getUser] About to call:', getUserAPI);
            console.log('🚀 [getUser] Full URL:', getUserAPI);
            console.log('🚀 [getUser] Has token:', !!idToken);
            const response = await axios.get(getUserAPI, {
                headers: {
                    Authorization: `Bearer ${idToken}`,
                },
            });
            console.log('✅ [getUser] Success! Status:', response.status);
            return response.data;
        }
        catch (error: any) {
            console.error('❌ [getUser] ERROR - URL called:', getUserAPI);
            console.error('❌ [getUser] Error message:', error?.message);
            console.error('❌ [getUser] Error code:', error?.code);
            console.error('❌ [getUser] Error response:', error?.response?.status, error?.response?.data);
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

            console.log('🚀 [createUser] About to call:', createUserAPI);
            console.log('🚀 [createUser] Full URL:', createUserAPI);
            console.log('🚀 [createUser] Request data:', userData);
            const response = await axios.post(createUserAPI, userData, {
                headers: {
                    Authorization: `Bearer ${idToken}`,
                    'Content-Type': 'application/json',
                },
            });
            console.log('✅ [createUser] Success! Status:', response.status);
            return response.data;
        }
        catch (error: any) {
            console.error('❌ [createUser] ERROR - URL called:', createUserAPI);
            console.error('❌ [createUser] Error message:', error?.message);
            console.error('❌ [createUser] Error code:', error?.code);
            console.error('❌ [createUser] Error response:', error?.response?.status, error?.response?.data);
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

    const getRecommendedUsers = async (idToken: string, userData: any) => {
        if (!idToken) {
            return Error('No ID token');
        }
        try {
            const response = await axios.get(getRecommendedUsersAPI, {
                params: userData,
                headers: {
                    Authorization: `Bearer ${idToken}`,
                    'Content-Type': 'application/json',
                },
            });
            return response.data;
        }
        catch (error) {
            throw error;
        }
    }

    return { getUser, createUser, getOrCreateUser, updateUser, getRecommendedUsers };


}