import { useEffect, useRef } from 'react';
import { useSupabaseAuth } from './useSupabaseAuth';
import { useAuthStore } from '../store/authStore';

export function useSupabaseAuthStateManager() {
    const { initialize } = useAuthStore();
    const isInitializedRef = useRef(false);
    const lastAuthStateRef = useRef<boolean | null>(null);
    const { user, session, loading } = useSupabaseAuth();

    useEffect(() => {
        const isAuthenticated = !!user && !!session;

        if (lastAuthStateRef.current === isAuthenticated) {
            return;
        }
        lastAuthStateRef.current = isAuthenticated;

        if (!isInitializedRef.current) {
            isInitializedRef.current = true;
            initialize();
        }

        useAuthStore.getState().setLoading(loading);
    }, [loading, initialize]);

    return {
        user,
        session,
        loading,
        isAuthenticated: !!user && !!session,
    };
}
