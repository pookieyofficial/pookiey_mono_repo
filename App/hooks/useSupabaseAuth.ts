import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { AuthError, Session, User } from '@supabase/supabase-js';
import * as SplashScreen from 'expo-splash-screen';
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
  const splashHiddenRef = useRef(false);
  const { getOrCreateUser } = useUser();


  useEffect(() => {

    // Check for the initial auth session on app load
    getInitialSession();


    // Handle the authentication state change globally in the app
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {

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
        await hideSplashScreen();
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



  // This function hides the splash screen after the authentication check is completed
  const hideSplashScreen = async () => {
    if (!splashHiddenRef.current) {
      try {
        setTimeout(async () => {
          await SplashScreen.hideAsync();
          splashHiddenRef.current = true;
        }, 300);
      } catch {
        console.error('Error hiding splash screen');
      }
    }
  };


  // This function is used to get the initial session on app load
  const getInitialSession = async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();

      if (error) {
        setLoading(false);
        return;
      }

      if (session) {
        setSession(session);
        setUser(session.user as SupabaseUser);
        await handleAuthSuccess(session.user as SupabaseUser, session.access_token);
      } else {
        setLoading(false);
        await hideSplashScreen();
      }
    } catch (error) {
      setLoading(false);
      await hideSplashScreen();
    }
  };

  // This function is used to handle the authentication success after any authentication method
  const handleAuthSuccess = async (supabaseUser: SupabaseUser, accessToken: string) => {
    try {
      if (!supabaseUser?.id) {
        router.replace('/(auth)');
        logout();
        await hideSplashScreen();
        return;
      }

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

      await hideSplashScreen();
    } catch (error: any) {
      console.error('Error handling auth success:', error);
      router.replace('/(auth)');
      logout();

      await hideSplashScreen();
    }
  };

  // This function is used to sign in with email
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
      return { data: null, error: error as AuthError };
    } finally {
      setLoading(false);
    }
  };


  // This function is used to sign in with phone OTP
  const signInWithPhone = async (phone: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signInWithOtp({
        phone,
      });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error: error as AuthError };
    } finally {
      setLoading(false);
    }
  };


  // This function is used to verify the OTP
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
      return { data: null, error: error as AuthError };
    } finally {
      setLoading(false);
    }
  };



  // This function is used to sign out the user globally in the app
  const signOut = async () => {

    try {
      setLoading(true);
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setSession(null);
      setUser(null);
      logout();
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };


  return {
    user,
    session,
    loading,
    signInWithEmail,
    signInWithPhone,
    verifyOtp,
    signOut,
  };
}
