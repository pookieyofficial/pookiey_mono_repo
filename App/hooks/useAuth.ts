import { useAuthStore } from '../store/authStore';

export function useAuth() {
  const {
    // State
    user,
    session,
    isAuthenticated,
    isLoading,
    isInitialized,
    idToken,
    notificationTokens,

    // Actions
    setUser,
    setSession,
    login,
    logout,
    setLoading,
    initialize,
    getIdToken,
    setIdToken,
    addNotificationToken,
    removeNotificationToken,
    getNotificationTokens,
    setNotificationTokens,

    // Supabase auth methods
    signInWithLink,
    signOut,
  } = useAuthStore();

  return {
    // State
    user,
    session,
    isAuthenticated,
    isLoading,
    isInitialized,
    idToken,
    notificationTokens,

    // Actions
    setUser,
    setSession,
    login,
    logout,
    setLoading,
    initialize,
    getIdToken,
    setIdToken,
    addNotificationToken,
    removeNotificationToken,
    getNotificationTokens,
    setNotificationTokens,

    // Supabase auth methods
    signInWithLink,
    signOut,
  };
}
