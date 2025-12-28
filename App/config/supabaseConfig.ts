import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || 'YOUR_SUPABASE_URL';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_KEY || process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY';

// Debug logging
// console.log('Supabase URL:', supabaseUrl);
// console.log('Supabase Key (first 20 chars):', supabaseAnonKey?.substring(0, 20) + '...');

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false, // We handle deep links manually in React Native
  },
});

export const getCurrentUser = () => {
  return supabase.auth.getUser();
};

export const getCurrentSession = () => {
  return supabase.auth.getSession();
};

export const signOut = () => {
  return supabase.auth.signOut();
};
