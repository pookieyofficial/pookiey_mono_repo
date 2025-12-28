import { Colors } from '@/constants/Colors';
import React, { useEffect, useRef, useState } from 'react';
import { Router, useRouter } from 'expo-router';
import {
    Animated,
    Dimensions,
    Image,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedText } from './ThemedText';
const { width, height } = Dimensions.get('window');

interface OnboardingSlide {
    id: number;
    title: string;
    description: string;
    imageUrl: string;
}

const onboardingData: OnboardingSlide[] = [
    {
        id: 1,
        title: "Algorithm",
        description: "Users going through a vetting process to ensure you never match with bots.",
        imageUrl: "https://images.pexels.com/photos/1375849/pexels-photo-1375849.jpeg",
    },
    {
        id: 2,
        title: "Verification",
        description: "We verify all profiles to ensure authentic connections and a safe dating environment.",
        imageUrl: "https://images.pexels.com/photos/792326/pexels-photo-792326.jpeg",
    },
    {
        id: 3,
        title: "Matches",
        description: "Find meaningful connections with people who share your values and interests.",
        imageUrl: "https://images.pexels.com/photos/1539936/pexels-photo-1539936.jpeg",
    },
];

interface OnboardingProps {
    onComplete: () => void;
}

export default function LandingScreen({ onComplete }: OnboardingProps) {
    const router = useRouter()
    const [currentSlide, setCurrentSlide] = useState(0);
    const slideAnim = useRef(new Animated.Value(0)).current;
    const autoScrollTimer = useRef<NodeJS.Timeout | null>(null);

    const currentSlideData = onboardingData[currentSlide];

    useEffect(() => {
        const startAutoScroll = () => {
            autoScrollTimer.current = setTimeout(() => {
                goToNextSlide();
            }, 4000) as any;
        };

        startAutoScroll();

        return () => {
            if (autoScrollTimer.current) {
                clearTimeout(autoScrollTimer.current);
            }
        };
    }, [currentSlide]);

    useEffect(() => {
        return () => {
            if (autoScrollTimer.current) {
                clearTimeout(autoScrollTimer.current);
            }
        };
    }, []);

    const goToNextSlide = () => {
        const nextSlide = (currentSlide + 1) % onboardingData.length;
        animateToSlide(nextSlide);
    };

    const animateToSlide = (targetSlide: number) => {
        if (autoScrollTimer.current) {
            clearTimeout(autoScrollTimer.current);
        }

        Animated.timing(slideAnim, {
            toValue: targetSlide,
            duration: 300,
            useNativeDriver: true,
        }).start(() => {
            setCurrentSlide(targetSlide);
        });
    };

    const goToSlide = (index: number) => {
        if (index !== currentSlide) {
            animateToSlide(index);
        }
    };

    const handleCreateAccount = () => {
        // if (autoScrollTimer.current) {
        //     clearTimeout(autoScrollTimer.current);
        // }
        // onComplete();
        router.replace('/(auth)/login')
        // router.push('/(onboarding)/profile')
    };

    const renderImage = (item: OnboardingSlide, index: number) => {
        const isCenter = index === currentSlide;

        const position = slideAnim.interpolate({
            inputRange: [index - 1, index, index + 1],
            outputRange: [width * 0.8, 0, -width * 0.8],
            extrapolate: 'clamp',
        });

        const scale = slideAnim.interpolate({
            inputRange: [index - 1, index, index + 1],
            outputRange: [0.8, 1, 0.8],
            extrapolate: 'clamp',
        });

        const opacity = slideAnim.interpolate({
            inputRange: [index - 1, index, index + 1],
            outputRange: [0.6, 1, 0.6],
            extrapolate: 'clamp',
        });

        return (
            <Animated.View
                key={item.id}
                style={[
                    styles.imageContainer,
                    {
                        transform: [
                            { translateX: position },
                            { scale },
                        ],
                        opacity,
                        zIndex: isCenter ? 10 : 5,
                    },
                ]}
            >
                <TouchableOpacity
                    style={styles.imageWrapper}
                    onPress={() => {
                        if (!isCenter) {
                            goToSlide(index);
                        }
                    }}
                    activeOpacity={isCenter ? 1 : 0.8}
                >
                    <Image
                        source={{ uri: item.imageUrl }}
                        style={styles.profileImage}
                        resizeMode="cover"
                    />
                </TouchableOpacity>
            </Animated.View>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor={Colors.onboarding.background} />

            <View style={styles.content}>
                <View style={styles.topSection}>
                    <View style={styles.galleryContainer}>
                        {onboardingData.map((item, index) => renderImage(item, index))}
                    </View>
                </View>

                <View style={styles.middleSection}>
                    <View style={styles.textContainer}>
                        <ThemedText type='title' style={styles.title}>{currentSlideData.title}</ThemedText>
                        <ThemedText type='defaultSemiBold' style={styles.description}>{currentSlideData.description}</ThemedText>
                    </View>
                    
                    <View style={styles.pagination}>
                        {onboardingData.map((_, index) => (
                            <TouchableOpacity
                                key={index}
                                style={[
                                    styles.dot,
                                    {
                                        backgroundColor: index === currentSlide ? Colors.primaryBackgroundColor : "grey",
                                    }
                                ]}
                                onPress={() => goToSlide(index)}
                                activeOpacity={0.7}
                            />
                        ))}
                    </View>
                </View>

                <View style={styles.bottomSection}>
                    <TouchableOpacity
                        style={styles.createAccountButton}
                        onPress={handleCreateAccount}
                        activeOpacity={0.8}
                    >
                        <ThemedText style={styles.createAccountButtonText}>
                            Let's Continue!
                        </ThemedText>
                    </TouchableOpacity>

                    <View style={styles.footerContainer}>
                        <View style={styles.termsContainer}>
                            <ThemedText style={styles.termsText}>
                                By continuing, you agree to our{' '}
                                <ThemedText
                                    style={styles.linkText}
                                    onPress={() => {/* Handle Terms navigation */ }}
                                >
                                    Terms & Conditions
                                </ThemedText>
                                {' '}and{' '}
                                <ThemedText
                                    style={styles.linkText}
                                    onPress={() => {/* Handle Privacy navigation */ }}
                                >
                                    Privacy Policy
                                </ThemedText>
                            </ThemedText>
                        </View>
                    </View>
                </View>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.onboarding.background,
    },
    header: {
        paddingHorizontal: 20,
        paddingBottom: 10,
    },
    headerText: {
        fontSize: 16,
        color: Colors.primaryBackgroundColor,
        fontWeight: '500',
    },
    content: {
        flex: 1,
        paddingHorizontal: Math.max(20, width * 0.05),
    },
    topSection: {
        flex: 3,
        justifyContent: 'center',
        alignItems: 'center',
    },
    middleSection: {
        flex: 2,
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 20,
    },
    bottomSection: {
        flex: 2,
        justifyContent: 'flex-end',
        alignItems: 'center',
    },
    galleryContainer: {
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 0,
    },
    imageContainer: {
        position: 'absolute',
        alignItems: 'center',
        justifyContent: 'center',
        width: width,
        height: '100%',
    },
    imageWrapper: {
        width: Math.min(width * 0.6, 280),
        height: Math.min(height * 0.35, 350),
        borderRadius: 20,
        overflow: 'hidden',
        shadowColor: Colors.onboarding.shadowColor,
        shadowOffset: {
            width: 0,
            height: 10,
        },
        shadowOpacity: Colors.opacity.shadow,
        shadowRadius: 20,
        elevation: 10,
        backgroundColor: Colors.primary.white,
    },
    profileImage: {
        width: '100%',
        height: '100%',
    },
    textContainer: {
        alignItems: 'center',
        paddingHorizontal: Math.max(16, width * 0.04),
        maxWidth: '100%',
        height: '100%',
        justifyContent: 'center',
        marginTop: 0,
    },
    title: {
        fontSize: Math.min(28, width * 0.07),
        color: Colors.primaryBackgroundColor,
        textAlign: 'center',
        marginBottom: 12,
    },
    description: {
        fontSize: Math.min(16, width * 0.04),
        color: Colors.primaryBackgroundColor,
        textAlign: 'center',
        lineHeight: Math.min(24, width * 0.06),
        paddingHorizontal: 10,
        minHeight: 48,
        maxHeight: 72,
    },
    pagination: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
        gap: 8,
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    createAccountButton: {
        width: Math.min(width * 0.85, 350),
        height: Math.max(48, height * 0.06),
        maxHeight: 60,
        backgroundColor: Colors.primaryBackgroundColor,
        borderRadius: Math.max(15, height * 0.02),
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
        shadowColor: Colors.primaryBackgroundColor,
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: Colors.opacity.buttonShadow,
        shadowRadius: 18,
        elevation: 10,
    },
    createAccountButtonText: {
        fontSize: 18,
        fontWeight: '600',
        color: "white",
    },
    footerContainer: {
        width: '100%',
        alignItems: 'center',
        marginVertical: 10,
    },
    termsContainer: {
        paddingHorizontal: 24,
        marginBottom: 10,
        alignItems: 'center',
        maxWidth: '100%',
    },
    termsText: {
        fontSize: 12,
        color: Colors.primaryBackgroundColor,
        textAlign: 'center',
        lineHeight: 22,
        flexWrap: 'wrap',
        maxWidth: '100%',
    },
    linkText: {
        fontSize: 14,
        color: Colors.primaryBackgroundColor,
        fontWeight: '600',
        textDecorationLine: 'underline',
    },
    signInContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 20,
        flexWrap: 'wrap',
    },
    signInText: {
        fontSize: 12,
        color: Colors.primaryBackgroundColor,
        textAlign: 'center',
    },
    signInLink: {
        fontSize: 12,
        color: Colors.primaryBackgroundColor,
        fontWeight: '600',
    },
});