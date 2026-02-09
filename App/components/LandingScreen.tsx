import { Colors } from '@/constants/Colors';
import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'expo-router';
import {
    Animated,
    StatusBar,
    StyleSheet,
    TouchableOpacity,
    View,
    Easing,
} from 'react-native';
import { ThemedText } from './ThemedText';
import { Linking } from 'react-native';


const slides = [
    {
        title: 'Smart Recommendations',
        subtitle:
            'Discover people nearby who match your interests, preferences, and vibe.',
    },
    {
        title: 'Talk Your Way',
        subtitle:
            'Chat, voice call, or video call your matches whenever the moment feels right.',
    },
    {
        title: 'See Who’s Around',
        subtitle:
            'Watch stories from people nearby and get a glimpse into their world.',
    },
];


const FloatingBubble = ({
    size,
    color,
    top,
    left,
    right,
    bottom,
    duration = 5000,
}: any) => {
    const anim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(anim, {
                    toValue: 1,
                    duration,
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: true,
                }),
                Animated.timing(anim, {
                    toValue: 0,
                    duration,
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: true,
                }),
            ])
        ).start();
    }, []);

    const translateY = anim.interpolate({
        inputRange: [0, 1],
        outputRange: [-20, 20],
    });

    const translateX = anim.interpolate({
        inputRange: [0, 1],
        outputRange: [-12, 12],
    });

    return (
        <Animated.View
            style={[
                {
                    position: 'absolute',
                    width: size,
                    height: size,
                    borderRadius: size / 2,
                    backgroundColor: color,
                    top,
                    left,
                    right,
                    bottom,
                    transform: [{ translateY }, { translateX }],
                },
            ]}
        />
    );
};

export default function LandingScreen() {
    const router = useRouter();
    const [index, setIndex] = useState(0);

    const fade = useRef(new Animated.Value(0)).current;
    const logoScale = useRef(new Animated.Value(0.9)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fade, {
                toValue: 1,
                duration: 800,
                useNativeDriver: true,
            }),
            Animated.spring(logoScale, {
                toValue: 1,
                friction: 6,
                tension: 80,
                useNativeDriver: true,
            }),
        ]).start();
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIndex((prev) => (prev + 1) % slides.length);
        }, 3500);
        return () => clearTimeout(timer);
    }, [index]);

    const handleContinue = () => {
        router.replace('/(auth)/login');
    };

    const slide = slides[index];

    return (
        <View style={styles.container}>
            <StatusBar
                barStyle="light-content"
                backgroundColor={Colors.primaryBackgroundColor}
            />

            {/* Floating bubbles */}
            <FloatingBubble size={300} color="rgba(255,255,255,0.07)" top={-100} left={-80} duration={7000} />
            <FloatingBubble size={220} color="rgba(255,255,255,0.05)" bottom={140} right={-60} duration={5500} />
            <FloatingBubble size={140} color="rgba(255,255,255,0.06)" top={120} right={40} duration={4800} />
            <FloatingBubble size={90} color="rgba(255,255,255,0.08)" bottom={260} left={40} duration={6200} />
            <FloatingBubble size={60} color="rgba(255,255,255,0.05)" top={260} left={110} duration={5000} />

            {/* Main content */}
            <Animated.View style={[styles.centerContent, { opacity: fade }]}>
                {/* Logo area (fixed position) */}
                <View style={styles.logoContainer}>
                    <View style={styles.logoGlow} />
                    <Animated.Image
                        source={require('@/assets/images/landing_screen.png')}
                        style={[
                            styles.logoImage,
                            { transform: [{ scale: logoScale }] },
                        ]}
                        resizeMode="cover"
                    />
                </View>

                {/* Text area with fixed height */}
                <View style={styles.textContainer}>
                    <ThemedText style={styles.title}>
                        {slide.title}
                    </ThemedText>
                    <ThemedText style={styles.subtitle}>
                        {slide.subtitle}
                    </ThemedText>
                </View>
            </Animated.View>

            {/* CTA */}
            <View style={styles.bottomPanel}>
                <TouchableOpacity
                    style={styles.ctaButton}
                    onPress={handleContinue}
                    activeOpacity={0.85}
                >
                    <ThemedText type="defaultSemiBold" style={styles.ctaText}>
                        Continue
                    </ThemedText>
                </TouchableOpacity>

                <ThemedText style={styles.terms}>
                    By continuing, you agree to our{' '}
                    <ThemedText
                        style={styles.link}
                        onPress={() => {
                            Linking.openURL('https://pookiey.com/privacy-policy');
                        }}
                    >
                        Privacy Policy
                    </ThemedText>
                </ThemedText>
            </View>

        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.primaryBackgroundColor,
        justifyContent: 'space-between',
    },

    centerContent: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 30,
    },

    logoContainer: {
        height: 220,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 10,
    },

    logoGlow: {
        position: 'absolute',
        width: 220,
        height: 220,
        borderRadius: 110,
        backgroundColor: 'rgba(255,255,255,0.12)',
    },

    logoImage: {
        width: 180,
        height: 180,
        borderRadius: 50,
    },

    textContainer: {
        height: 90, // fixed height prevents logo movement
        justifyContent: 'center',
        alignItems: 'center',
    },

    title: {
        fontSize: 30,
        color: '#fff',
        textAlign: 'center',
        marginBottom: 6,
    },

    subtitle: {
        fontSize: 16,
        color: '#f2f2f2',
        textAlign: 'center',
        lineHeight: 22,
        paddingHorizontal: 20,
    },

    bottomPanel: {
        backgroundColor: '#fff',
        paddingHorizontal: 24,
        paddingTop: 22,
        paddingBottom: 32,
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        alignItems: 'center',
    },

    ctaButton: {
        width: '100%',
        height: 54,
        backgroundColor: Colors.primaryBackgroundColor,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 14,
    },

    ctaText: {
        color: '#fff',
        fontSize: 18,
    },

    terms: {
        fontSize: 12,
        color: '#666',
        textAlign: 'center',
        lineHeight: 18,
    },

    link: {
        color: Colors.primaryBackgroundColor,
    },
});
