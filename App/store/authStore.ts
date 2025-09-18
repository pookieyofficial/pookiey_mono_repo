import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '@supabase/supabase-js';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

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
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitialized: boolean;
  idToken: string | null;
  notificationTokens: string[];
}

interface AuthActions {
  setUser: (user: SupabaseUser | null) => void;
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
}

type AuthStore = AuthState & AuthActions;

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  isInitialized: false,
  idToken: null,
  notificationTokens: [],
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
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),

      partialize: (state) => ({
        user: state.user,
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
