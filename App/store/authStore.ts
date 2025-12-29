import AsyncStorage from '@react-native-async-storage/async-storage';
import { Session, AuthError } from '@supabase/supabase-js';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { router } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { supabase } from '../config/supabaseConfig';
import { useUser } from '../hooks/useUser';
import type { SupabaseUser, DBUser } from '../types';
import { deepLinkState } from '../utils/deepLinkState';

// Re-export types for convenience
export type { SupabaseUser, DBUser };

interface AuthState {
  user: SupabaseUser | null;
  dbUser: DBUser | null; // ✅ NEW
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
  setDBUser: (user: DBUser | null) => void; // ✅ NEW
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

  signInWithLink: (email: string) => Promise<{ data: any; error: AuthError | null }>;
  verifyEmailOtp: (email: string, token: string) => Promise<{ data: any; error: AuthError | null }>;
  signOut: () => Promise<void>;

  setupAuthListener: () => void;
  getInitialSession: () => Promise<void>;
  handleAuthSuccess: (supabaseUser: SupabaseUser, accessToken: string) => Promise<void>;
  hideSplashScreen: () => Promise<void>;
}

type AuthStore = AuthState & AuthActions;

const initialState: AuthState = {
  user: null,
  dbUser: null, // ✅ NEW
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
        set({ user, isAuthenticated: !!user });
      },

      // ✅ NEW
      setDBUser: (user: DBUser | null) => {
        set({ dbUser: user });
      },

      setSession: (session: Session | null) => set({ session }),

      login: (user: SupabaseUser) =>
        set({
          user,
          isAuthenticated: true,
          isLoading: false,
        }),

      logout: () => {
        set({
          user: null,
          dbUser: null, // ✅ clear it
          session: null,
          isAuthenticated: false,
          isLoading: false,
          idToken: null,
          notificationTokens: [],
        });
        // Clear pending deeplink on logout
        deepLinkState.clearPendingDeeplink();
      },

      setLoading: (loading: boolean) => set({ isLoading: loading }),

      initialize: () => set({ isInitialized: true, isLoading: false }),

      getIdToken: () => get().idToken,

      setIdToken: (token: string | null) => set({ idToken: token }),

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

      getNotificationTokens: () => get().notificationTokens,

      setNotificationTokens: (tokens: string[]) => set({ notificationTokens: tokens }),

      signInWithLink: async (email: string) => {
        try {
          set({ isLoading: true });
          const { data, error } = await supabase.auth.signInWithOtp({ email });
          if (error) throw error;
          return { data, error: null };
        } catch (error) {
          return { data: null, error: error as AuthError };
        } finally {
          set({ isLoading: false });
        }
      },

      verifyEmailOtp: async (email: string, token: string) => {
        try {
          set({ isLoading: true });
          const { data, error } = await supabase.auth.verifyOtp({
            email,
            token,
            type: 'email',
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
          get().logout();
        } catch (error) {
          console.error('Sign out error:', error);
        } finally {
          set({ isLoading: false });
        }
      },

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
            get().logout();
            await get().hideSplashScreen();
            return;
          }

          console.log('🔄 handleAuthSuccess - calling getOrCreateUser...');
          const { getOrCreateUser } = useUser();

          const response = await getOrCreateUser(accessToken, supabaseUser);
          const dbUser = response?.data?.user || response?.data;

          const { setDBUser, login, setIdToken } = get();
          setDBUser(dbUser);
          login(supabaseUser);
          setIdToken(accessToken);

          const pendingDeeplink = deepLinkState.getPendingDeeplink();

          // Determine the target route
          let targetRoute: string;

          if (dbUser?.profile?.isOnboarded) {
            // User is onboarded - check for deeplink or go to home
            if (pendingDeeplink) {
              targetRoute = pendingDeeplink;
              deepLinkState.clearPendingDeeplink();
            } else {
              targetRoute = '/(home)/(tabs)';
            }
          } else {
            // User is not onboarded - must go through onboarding first
            targetRoute = '/(onboarding)/profile';
          }

          router.replace(targetRoute as any);
          await get().hideSplashScreen();
        } catch (error) {
          console.error('Auth success error:', error);
          router.replace('/(auth)');
          get().logout();
          await get().hideSplashScreen();
        }
      },

      getInitialSession: async () => {
        try {
          const { data: { session }, error } = await supabase.auth.getSession();

          if (error) {
            set({ isLoading: false });
            await get().hideSplashScreen();
            return;
          }

          if (session) {
            const { setSession, setUser, handleAuthSuccess } = get();
            setSession(session);
            setUser(session.user as SupabaseUser);

            await handleAuthSuccess(session.user as SupabaseUser, session.access_token);
          } else {
            set({ isLoading: false });
            await get().hideSplashScreen();
          }
        } catch (error) {
          set({ isLoading: false });
          await get().hideSplashScreen();
        }
      },

      setupAuthListener: () => {
        const { isAuthListenerSetup } = get();
        if (isAuthListenerSetup) return;

        set({ isAuthListenerSetup: true });

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
          const { lastAuthState, isInitialized, isLoading } = get();
          const isAuthenticated = !!session?.user;


          // Don't do anything if auth state hasn't changed, except on explicit SIGNED_IN
          if (event !== 'SIGNED_IN' && lastAuthState === isAuthenticated) {
            console.log('⏭️ Auth state unchanged, skipping');
            return;
          }

          set({ lastAuthState: isAuthenticated });

          if (session?.user) {
            const { setSession, setUser, handleAuthSuccess } = get();
            setSession(session);
            setUser(session.user as SupabaseUser);

            const shouldTriggerAuthSuccess = event === 'SIGNED_IN' || !lastAuthState || !isInitialized;

            if (shouldTriggerAuthSuccess) {
              await handleAuthSuccess(session.user as SupabaseUser, session.access_token);
            } else {
              // Just update the session and user, don't route again
              const { initialize, hideSplashScreen } = get();
              deepLinkState.clearPendingDeeplink();

              if (!isInitialized) {
                initialize();
              }
              set({ isLoading: false });
              await hideSplashScreen();
            }
          } else {
            const { setSession, setUser, logout, hideSplashScreen, initialize } = get();
            setSession(null);
            setUser(null);

            if (isInitialized && !isLoading) {
              router.replace('/(auth)');
              logout();
            }

            if (!isInitialized) {
              initialize();
            }
            set({ isLoading: false });
            await hideSplashScreen();
          }
        });
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        user: state.user,
        dbUser: state.dbUser,
        session: state.session,
        isAuthenticated: state.isAuthenticated,
        idToken: state.idToken,
        notificationTokens: state.notificationTokens,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.isLoading = false;
          state.isInitialized = true;
          console.log('Store rehydrated - user:', state.user?.email);
        }
      },
    }
  )
);
