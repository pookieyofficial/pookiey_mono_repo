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
        try {
            console.log('🔍 createUser - Supabase user data:', JSON.stringify(supabaseUser, null, 2));

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

            console.log('📤 createUser - Sending additional user data to backend:', JSON.stringify(userData, null, 2));


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
            console.log('🔍 getOrCreateUser - Attempting to fetch existing user...');
            const existingUser = await getUser(idToken);
            console.log('✅ getOrCreateUser - Found existing user:', existingUser?.data?.email);
            return existingUser;
        }
        catch (error: any) {
            const status = error?.response?.status;
            console.log('❌ getOrCreateUser - Get user failed with status:', status);
            
            if (status === 404) {
                try {
                    console.log('🔄 getOrCreateUser - User not found, creating new user...');
                    const createResult = await createUser(idToken, supabaseUser);
                    console.log('✅ getOrCreateUser - User created:', createResult?.success);
                    
                    if (createResult?.success) {
                        console.log('🔄 getOrCreateUser - Fetching newly created user...');
                        return await getUser(idToken);
                    }
                    return createResult;
                } catch (createError: any) {
                    console.log('❌ getOrCreateUser - Create user failed:', createError?.response?.status);
                    
                    if (createError?.response?.status === 400) {
                        try {
                            console.log('🔄 getOrCreateUser - Retrying get user after 400 error...');
                            return await getUser(idToken);
                        } catch (getError) {
                            console.log('❌ getOrCreateUser - Final get user failed');
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