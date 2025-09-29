import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseServiceKey) {
    console.warn('SUPABASE_SERVICE_ROLE_KEY is not set. Some operations may fail.');
    console.log({supabaseUrl})
    console.log({supabaseServiceKey})
    throw new Error("no Supabase is Comfigured in the backend")
}

export const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

export const verifySupabaseToken = async (token: string) => {
    try {
        const { data: { user }, error } = await supabase.auth.getUser(token);

        if (error) {
            return null;
        }

        return user;
    } catch (error) {
        return null;
    }
};
