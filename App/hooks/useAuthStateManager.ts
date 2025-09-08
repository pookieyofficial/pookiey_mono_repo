import { router } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { onAuthStateChanged } from 'firebase/auth';
import { useEffect, useRef } from 'react';
import { auth } from '../firebaseConfig';
import { useAuthStore } from '../store/authStore';

export function useAuthStateManager() {
    const { login, logout, initialize, setIdToken } = useAuthStore();
    const isInitializedRef = useRef(false);
    const lastAuthStateRef = useRef<boolean | null>(null);

    useEffect(() => {

        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            const isAuthenticated = !!firebaseUser;
            if (lastAuthStateRef.current === isAuthenticated) {
                return;
            }

            lastAuthStateRef.current = isAuthenticated;

            if (firebaseUser) {
                try {
                    const idToken = await firebaseUser.getIdToken();

                    login(firebaseUser);
                    setIdToken(idToken);

                    
                    router.replace('/(onboarding)/profile');
                } catch (error) {
                    login(firebaseUser);
                    router.replace('/(onboarding)/profile');
                }
            } else {
                logout();
                
                if (isInitializedRef.current) {
                    router.replace('/(auth)');
                }
            }

            if (!isInitializedRef.current) {
                isInitializedRef.current = true;
                initialize();
                SplashScreen.hideAsync();
            }
        });

        return unsubscribe;
    }, [login, logout, initialize, setIdToken]);
}
