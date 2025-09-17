import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || 'https://szzxdypursgvddxlhkud.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN6enhkeXB1cnNndmRkeGxoa3VkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc3NTk3NjgsImV4cCI6MjA3MzMzNTc2OH0.6r_PB5r7difRLD6JW4d6CB06sdJYCFc7slD4LGRJUps';

if (!supabaseServiceKey) {
    console.warn('SUPABASE_SERVICE_ROLE_KEY is not set. Some operations may fail.');
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
