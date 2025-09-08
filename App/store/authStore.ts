import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from 'firebase/auth';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitialized: boolean;
  idToken: string | null;
}

interface AuthActions {
  setUser: (user: User | null) => void;
  login: (user: User) => void;
  logout: () => void;
  setLoading: (loading: boolean) => void;
  initialize: () => void;
  getIdToken: (forceRefresh?: boolean) => Promise<string | null>;
  setIdToken: (token: string | null) => void;
}

type AuthStore = AuthState & AuthActions;

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  isInitialized: false,
  idToken: null,
};

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      setUser: (user: User | null) => {
        set({
          user,
          isAuthenticated: !!user,
        });
      },

      login: (user: User) => {
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
        });
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },

      initialize: () => {
        set({ isInitialized: true, isLoading: false });
      },

      getIdToken: async (forceRefresh = false) => {
        const { user } = get();
        if (user) {
          try {
            const token = await user.getIdToken(forceRefresh);
            set({ idToken: token });
            return token;
          } catch (error) {
            console.error('Error getting ID token:', error);
            return null;
          }
        }
        return null;
      },

      setIdToken: (token: string | null) => {
        set({ idToken: token });
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),

      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        idToken: state.idToken,
      }),

      onRehydrateStorage: () => (state) => {
        if (state) {
          state.isLoading = false;
          state.isInitialized = true;
          console.log('Store: Rehydration complete - Phone:', state.user?.phoneNumber);
        }
      },
    }
  )
);
