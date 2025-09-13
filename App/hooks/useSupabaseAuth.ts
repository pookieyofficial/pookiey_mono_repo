import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { AuthError, Session, User } from '@supabase/supabase-js';
import { supabase } from '../config/supabaseConfig';
import { useAuthStore } from '../store/authStore';
import { useUser } from './useUser';

export interface SupabaseUser {
  id: string;
  email?: string;
  phone?: string;
  user_metadata?: {
    phone?: string;
    email?: string;
    full_name?: string;
    avatar_url?: string;
  };
  app_metadata?: {
    provider?: string;
  };
}

export function useSupabaseAuth() {
  const { login, logout, initialize, setIdToken, isLoading } = useAuthStore();
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const isInitializedRef = useRef(false);
  const lastAuthStateRef = useRef<boolean | null>(null);
  const { getOrCreateUser } = useUser();

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting initial session:', error);
          setLoading(false);
          return;
        }

        if (session) {
          setSession(session);
          setUser(session.user as SupabaseUser);
          await handleAuthSuccess(session.user as SupabaseUser, session.access_token);
        } else {
          setLoading(false);
        }
      } catch (error) {
        console.error('Error in getInitialSession:', error);
        setLoading(false);
      }
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.id);
        
        const isAuthenticated = !!session?.user;

        if (lastAuthStateRef.current === isAuthenticated) {
          return;
        }
        lastAuthStateRef.current = isAuthenticated;

        if (session?.user) {
          setSession(session);
          setUser(session.user as SupabaseUser);
          await handleAuthSuccess(session.user as SupabaseUser, session.access_token);
        } else {
          setSession(null);
          setUser(null);
          if (isInitializedRef.current && !isLoading) {
            router.replace('/(auth)');
            logout();
          }
        }

        if (!isInitializedRef.current) {
          isInitializedRef.current = true;
          initialize();
        }

        setLoading(false);
        useAuthStore.getState().setLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleAuthSuccess = async (supabaseUser: SupabaseUser, accessToken: string) => {
    try {
      if (!supabaseUser?.id) {
        router.replace('/(auth)');
        logout();
        return;
      }

      // Get or create user in your backend
      const user = await getOrCreateUser(
        accessToken,
        supabaseUser
      );

      if (user?.data?.profile?.isOnboarded) {
        router.replace('/(home)');
      } else {
        router.replace('/(onboarding)/profile');
      }

      login(supabaseUser);
      setIdToken(accessToken);
    } catch (error: any) {
      console.error('Error in handleAuthSuccess:', error);
      router.replace('/(auth)');
      logout();
    }
  };

  const signInWithEmail = async (email: string, password: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error signing in with email:', error);
      return { data: null, error: error as AuthError };
    } finally {
      setLoading(false);
    }
  };

  const signUpWithEmail = async (email: string, password: string, metadata?: any) => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata,
        },
      });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error signing up with email:', error);
      return { data: null, error: error as AuthError };
    } finally {
      setLoading(false);
    }
  };

  const signInWithPhone = async (phone: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signInWithOtp({
        phone,
      });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error signing in with phone:', error);
      return { data: null, error: error as AuthError };
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async (phone: string, token: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.verifyOtp({
        phone,
        token,
        type: 'sms',
      });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error verifying OTP:', error);
      return { data: null, error: error as AuthError };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      setSession(null);
      setUser(null);
      logout();
      router.replace('/(auth)');
    } catch (error) {
      console.error('Error signing out:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.resetPasswordForEmail(email);
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error resetting password:', error);
      return { data: null, error: error as AuthError };
    } finally {
      setLoading(false);
    }
  };

  return {
    user,
    session,
    loading,
    signInWithEmail,
    signUpWithEmail,
    signInWithPhone,
    verifyOtp,
    signOut,
    resetPassword,
  };
}
