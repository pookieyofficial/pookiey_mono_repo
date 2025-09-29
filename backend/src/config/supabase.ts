import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();


const supabaseUrl = process.env.SUPABASE_URL as string;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY as string  ;

if (!supabaseServiceKey || !supabaseUrl) {
    console.warn('SUPABASE_SERVICE_ROLE_KEY or SUPABASE_URL is not set.');
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
