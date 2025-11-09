import { useEffect } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { supabase } from '../../config/supabaseConfig';
import { Colors } from '../../constants/Colors';

export default function AuthCallback() {
    useEffect(() => {
        const handleAuthCallback = async () => {
            try {
                const { data, error } = await supabase.auth.getSession();

                if (error) {
                    console.error('Auth callback error:', error);
                    router.replace('/(auth)');
                    return;
                }

                if (data.session) {
                    router.replace('/(home)/(tabs)');
                } else {
                    router.replace('/(auth)');
                }
            } catch (error) {
                console.error('Unexpected error in auth callback:', error);
                router.replace('/(auth)');
            }
        };

        handleAuthCallback();
    }, []);

    return (
        <View style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: Colors.primary.white,
        }}>
            <ActivityIndicator size="large" color={Colors.primary.red} />
            <Text style={{
                marginTop: 16,
                fontSize: 16,
                color: Colors.text.secondary,
            }}>
                Completing sign in...
            </Text>
        </View>
    );
}
