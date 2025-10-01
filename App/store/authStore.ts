import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, Session, AuthError } from '@supabase/supabase-js';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { router } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { supabase } from '../config/supabaseConfig';
import { useUser } from '../hooks/useUser';

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

interface AuthState {
  user: SupabaseUser | null;
  session: Session | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitialized: boolean;
  idToken: string | null;
  notificationTokens: string[];
  isAuthListenerSetup: boolean;
  lastAuthState: boolean | null;
  splashHidden: boolean;
}

interface AuthActions {
  setUser: (user: SupabaseUser | null) => void;
  setSession: (session: Session | null) => void;
  login: (user: SupabaseUser) => void;
  logout: () => void;
  setLoading: (loading: boolean) => void;
  initialize: () => void;
  getIdToken: () => string | null;
  setIdToken: (token: string | null) => void;
  addNotificationToken: (token: string) => void;
  removeNotificationToken: (token: string) => void;
  getNotificationTokens: () => string[];
  setNotificationTokens: (tokens: string[]) => void;

  // Supabase auth methods
  signInWithLink: (email: string) => Promise<{ data: any; error: AuthError | null }>;
  signOut: () => Promise<void>;

  // Auth state management
  setupAuthListener: () => void;
  getInitialSession: () => Promise<void>;
  handleAuthSuccess: (supabaseUser: SupabaseUser, accessToken: string) => Promise<void>;
  hideSplashScreen: () => Promise<void>;
}

type AuthStore = AuthState & AuthActions;

const initialState: AuthState = {
  user: null,
  session: null,
  isAuthenticated: false,
  isLoading: true,
  isInitialized: false,
  idToken: null,
  notificationTokens: [],
  isAuthListenerSetup: false,
  lastAuthState: null,
  splashHidden: false,
};

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      setUser: (user: SupabaseUser | null) => {
        set({
          user,
          isAuthenticated: !!user,
        });
      },

      setSession: (session: Session | null) => {
        set({ session });
      },

      login: (user: SupabaseUser) => {
        set({
          user,
          isAuthenticated: true,
          isLoading: false,
        });
      },

      logout: () => {
        set({
          user: null,
          session: null,
          isAuthenticated: false,
          isLoading: false,
          idToken: null,
          notificationTokens: [],
        });
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },

      initialize: () => {
        set({ isInitialized: true, isLoading: false });
      },

      getIdToken: () => {
        const { idToken } = get();
        return idToken;
      },

      setIdToken: (token: string | null) => {
        set({ idToken: token });
      },

      addNotificationToken: (token: string) => {
        const { notificationTokens } = get();
        if (!notificationTokens.includes(token)) {
          set({ notificationTokens: [...notificationTokens, token] });
        }
      },

      removeNotificationToken: (token: string) => {
        const { notificationTokens } = get();
        set({ notificationTokens: notificationTokens.filter(t => t !== token) });
      },

      getNotificationTokens: () => {
        const { notificationTokens } = get();
        return notificationTokens;
      },

      setNotificationTokens: (tokens: string[]) => {
        set({ notificationTokens: tokens });
      },

      signInWithLink: async (email: string) => {
        try {
          set({ isLoading: true });
          const { data, error } = await supabase.auth.signInWithOtp({
            email: email,
          });
          if (error) throw error;
          return { data, error: null };
        } catch (error) {
          return { data: null, error: error as AuthError };
        } finally {
          set({ isLoading: false });
        }
      },

      signOut: async () => {
        try {
          set({ isLoading: true });
          const { error } = await supabase.auth.signOut();
          if (error) throw error;
          router.replace('/(auth)');
          const { logout } = get();
          logout();
        } catch (error) {
          console.error('Sign out error:', error);
        } finally {
          set({ isLoading: false });
        }
      },

      // Auth state management methods
      hideSplashScreen: async () => {
        const { splashHidden } = get();
        if (!splashHidden) {
          try {
            setTimeout(async () => {
              await SplashScreen.hideAsync();
              set({ splashHidden: true });
            }, 300);
          } catch {
            console.error('Error hiding splash screen');
          }
        }
      },

      handleAuthSuccess: async (supabaseUser: SupabaseUser, accessToken: string) => {

        try {
          if (!supabaseUser?.id) {
            router.replace('/(auth)');
            const { logout } = get();
            logout();
            const { hideSplashScreen } = get();
            await hideSplashScreen();
            return;
          }

          console.log('🔄 --- ---  handleAuthSuccess - Calling getOrCreateUser...');

          // Get the useUser hook instance
          const { getOrCreateUser } = useUser();
          const user = await getOrCreateUser(accessToken, supabaseUser);


          if (user?.data?.profile?.isOnboarded) {
            router.replace('/(home)');
          } else {
            router.replace('/(onboarding)/profile');
          }

          const { login, setIdToken } = get();
          login(supabaseUser);
          setIdToken(accessToken);

          const { hideSplashScreen } = get();
          await hideSplashScreen();

        } catch (error: any) {
          router.replace('/(auth)');
          const { logout } = get();
          logout();

          const { hideSplashScreen } = get();
          await hideSplashScreen();
        }
      },

      getInitialSession: async () => {
        try {
          const { data: { session }, error } = await supabase.auth.getSession();

          if (error) {
            set({ isLoading: false });
            return;
          }

          if (session) {
            const { setSession, setUser, handleAuthSuccess } = get();
            setSession(session);
            setUser(session.user as SupabaseUser);
            await handleAuthSuccess(session.user as SupabaseUser, session.access_token);
          } else {
            set({ isLoading: false });
            const { hideSplashScreen } = get();
            await hideSplashScreen();
          }
        } catch (error) {
          set({ isLoading: false });
          const { hideSplashScreen } = get();
          await hideSplashScreen();
        }
      },

      setupAuthListener: () => {
        const { isAuthListenerSetup } = get();

        // Prevent multiple listeners
        if (isAuthListenerSetup) {
          return;
        }

        set({ isAuthListenerSetup: true });

        // Handle the authentication state change globally in the app
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
          const { lastAuthState, isInitialized, isLoading } = get();
          const isAuthenticated = !!session?.user;

          // Prevent duplicate processing
          if (lastAuthState === isAuthenticated) {
            return;
          }

          set({ lastAuthState: isAuthenticated });

          if (session?.user) {
            const { setSession, setUser, handleAuthSuccess } = get();
            setSession(session);
            setUser(session.user as SupabaseUser);
            console.log("Session data: ", session)
            await handleAuthSuccess(session.user as SupabaseUser, session.access_token);
          } else {
            const { setSession, setUser, logout, hideSplashScreen } = get();
            setSession(null);
            setUser(null);

            if (isInitialized && !isLoading) {
              router.replace('/(auth)');
              logout();
            }
            await hideSplashScreen();
          }

          const { initialize } = get();
          if (!isInitialized) {
            initialize();
          }

          set({ isLoading: false });
        });
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),

      partialize: (state) => ({
        user: state.user,
        session: state.session,
        isAuthenticated: state.isAuthenticated,
        idToken: state.idToken,
        notificationTokens: state.notificationTokens,
      }),

      onRehydrateStorage: () => (state) => {
        if (state) {
          state.isLoading = false;
          state.isInitialized = true;
          console.log('Store: Rehydration complete - Phone:', state.user?.phone);
        }
      },
    }
  )
);
