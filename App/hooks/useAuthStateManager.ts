import { router } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { onAuthStateChanged } from 'firebase/auth';
import { useEffect, useRef } from 'react';
import { auth } from '../firebaseConfig';
import { useAuthStore } from '../store/authStore';
import { useUser } from './useUser';

export function useAuthStateManager() {
    const { login, logout, initialize, setIdToken, isLoading } = useAuthStore();
    const isInitializedRef = useRef(false);
    const lastAuthStateRef = useRef<boolean | null>(null);
    const { getOrCreateUser } = useUser();
    SplashScreen.preventAutoHideAsync();

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
                    if (!firebaseUser?.phoneNumber || !firebaseUser?.uid) {
                        router.replace('/(auth)');
                        logout();
                        return;
                    }
                    console.log({ idToken });
                    const user = await getOrCreateUser(idToken, firebaseUser.uid, firebaseUser.phoneNumber || '');
                    console.log({ user });
                    console.log({ isOnboarded: user?.data?.profile?.isOnboarded });
                    if (user?.data?.profile?.isOnboarded) {
                        router.replace('/(home)');
                    } else {
                        router.replace('/(onboarding)/profile');
                    }
                    login(firebaseUser);
                    setIdToken(idToken);

                } catch (error: any) {
                    console.log(error.message);
                    router.replace('/(auth)');
                    logout();
                }
            } else {
                if (isInitializedRef.current && !isLoading) {
                    router.replace('/(auth)');
                    logout();
                }
                logout();
            }

            if (!isInitializedRef.current) {
                isInitializedRef.current = true;
                initialize();
            }

            useAuthStore.getState().setLoading(false);
            SplashScreen.hideAsync();
        });

        return unsubscribe;
    }, [login, logout, initialize, setIdToken]);

}
