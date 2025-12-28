import CustomBackButton from '@/components/CustomBackButton';
import CustomDialog from '@/components/CustomDialog';
import MainButton from '@/components/MainButton';
import { ThemedText } from '@/components/ThemedText';
import { Colors } from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { Audio } from 'expo-av';
import React, { useEffect, useState } from 'react';
import {
    StyleSheet,
    View,
    Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

export default function MicrophoneScreen() {
    const { t } = useTranslation();
    const params = useLocalSearchParams();
    const fromHome = params.fromHome === 'true';
    const [isLoading, setIsLoading] = useState(false);
    const [hasPermission, setHasPermission] = useState(false);
    const [showErrorDialog, setShowErrorDialog] = useState(false);

    const checkMicrophonePermission = async () => {
        try {
            const { status } = await Audio.getPermissionsAsync();
            setHasPermission(status === 'granted');
            return status === 'granted';
        } catch (error) {
            // console.error('Error checking microphone permission:', error);
            return false;
        }
    };

    useEffect(() => {
        checkMicrophonePermission();
    }, []);

    const requestMicrophonePermission = async () => {
        setIsLoading(true);
        try {
            const { status } = await Audio.requestPermissionsAsync();

            if (status === 'granted') {
                setHasPermission(true);
            } else {
                setShowErrorDialog(true);
            }
        } catch (error) {
            // console.error('Error requesting microphone permission:', error);
            setShowErrorDialog(true);
        } finally {
            setIsLoading(false);
        }
    };

    const handleContinue = () => {
        if (hasPermission) {
            // If accessed from home, go back to home. Otherwise, continue onboarding to location
            if (fromHome) {
                router.replace('/(home)/(tabs)');
            } else {
                router.push('/(onboarding)/location');
            }
        } else {
            requestMicrophonePermission();
        }
    };

    if (hasPermission) {
        return (
            <SafeAreaView style={styles.container}>
                {!fromHome && <CustomBackButton />}
                <View style={styles.content}>
                    <View style={styles.illustrationContainer}>
                        <View style={styles.illustration}>
                            <View style={[styles.circle, styles.circle1]} />
                            <View style={[styles.circle, styles.circle2]} />
                            <View style={[styles.circle, styles.circle3]} />
                            <View style={styles.microphoneContainer}>
                                <Ionicons name="checkmark-circle" size={80} color={"white"} />
                            </View>
                        </View>
                    </View>

                    <View style={styles.textContainer}>
                        <ThemedText type="title" style={styles.title}>
                            {t('microphone.microphoneEnabled')}
                        </ThemedText>
                        <ThemedText type="subtitle" style={styles.subtitle}>
                            {t('microphone.microphoneEnabledSubtitle')}
                        </ThemedText>
                    </View>

                    <View style={styles.spacer} />

                    <MainButton
                        title={t('microphone.continue')}
                        onPress={handleContinue}
                    />
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            {!fromHome && <CustomBackButton />}
            <View style={styles.content}>
                <View style={styles.illustrationContainer}>
                    <View style={styles.illustration}>
                        <View style={[styles.circle, styles.circle1]} />
                        <View style={[styles.circle, styles.circle2]} />
                        <View style={[styles.circle, styles.circle3]} />
                        <View style={styles.microphoneContainer}>
                            <Ionicons name="mic" size={60} color="white" />
                        </View>
                    </View>
                </View>

                <View style={styles.textContainer}>
                    <ThemedText type="title" style={styles.title}>
                        {t('microphone.title')}
                    </ThemedText>
                    <ThemedText style={styles.subtitle}>
                        {t('microphone.subtitle')}
                    </ThemedText>
                </View>

                <View style={styles.featuresList}>
                    <View style={styles.featureItem}>
                        <View style={styles.featureIcon}>
                            <Ionicons name="mic" size={20} color={Colors.primaryBackgroundColor} />
                        </View>
                        <ThemedText style={styles.featureText}>
                            {t('microphone.sendVoiceNotes')}
                        </ThemedText>
                    </View>

                    <View style={styles.featureItem}>
                        <View style={styles.featureIcon}>
                            <Ionicons name="call" size={20} color={Colors.primaryBackgroundColor} />
                        </View>
                        <ThemedText style={styles.featureText}>
                            {t('microphone.makeVoiceCalls')}
                        </ThemedText>
                    </View>

                    <View style={styles.featureItem}>
                        <View style={styles.featureIcon}>
                            <Ionicons name="chatbubble" size={20} color={Colors.primaryBackgroundColor} />
                        </View>
                        <ThemedText style={styles.featureText}>
                            {t('microphone.enhanceCommunication')}
                        </ThemedText>
                    </View>
                </View>

                <View style={styles.spacer} />

                <MainButton
                    title={isLoading ? t('microphone.enablingMicrophone') : t('microphone.allowMicrophone')}
                    onPress={handleContinue}
                    disabled={isLoading}
                />
            </View>

            <CustomDialog
                visible={showErrorDialog}
                type="error"
                message={t('microphone.unableToEnable')}
                onDismiss={() => setShowErrorDialog(false)}
                primaryButton={{
                    text: t('microphone.tryAgain'),
                    onPress: () => {
                        setShowErrorDialog(false);
                        requestMicrophonePermission();
                    }
                }}
                secondaryButton={{
                    text: t('microphone.skip'),
                    onPress: () => {
                        setShowErrorDialog(false);
                        if (fromHome) {
                            router.replace('/(home)/(tabs)');
                        } else {
                            router.push('/(onboarding)/location');
                        }
                    }
                }}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#ffffff',
    },
    content: {
        flex: 1,
        paddingHorizontal: 10,
    },
    illustrationContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginVertical: 40,
    },
    illustration: {
        width: 200,
        height: 200,
        position: 'relative',
        justifyContent: 'center',
        alignItems: 'center',
    },
    circle: {
        position: 'absolute',
        borderRadius: 50,
    },
    circle1: {
        width: 120,
        height: 120,
        backgroundColor: 'rgba(168, 85, 247, 0.8)',
        top: 20,
        left: 40,
    },
    circle2: {
        width: 100,
        height: 100,
        backgroundColor: 'rgba(168, 85, 247, 0.6)',
        top: 10,
        right: 30,
    },
    circle3: {
        width: 80,
        height: 80,
        backgroundColor: 'rgba(168, 85, 247, 0.4)',
        bottom: 30,
        left: 60,
    },
    microphoneContainer: {
        zIndex: 10,
        backgroundColor: 'transparent',
        borderRadius: 40,
        padding: 20,
        shadowColor: Colors.secondaryForegroundColor,
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 8,
        elevation: 5,
    },
    textContainer: {
        alignItems: 'center',
        marginBottom: 30,
    },
    title: {
        textAlign: 'center',
        marginBottom: 16,
        letterSpacing: -0.5,
    },
    subtitle: {
        fontSize: 16,
        color: Colors.secondaryForegroundColor,
        textAlign: 'center',
        paddingHorizontal: 20,
        marginTop: 10,
    },
    featuresList: {
        marginBottom: 20,
        paddingHorizontal: 10,
    },
    featureItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
        paddingHorizontal: 10,
    },
    featureIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(168, 85, 247, 0.1)',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
    },
    featureText: {
        fontSize: 16,
        color: Colors.primaryForegroundColor,
        flex: 1,
    },
    spacer: {
        flex: 0.3,
    },
});

