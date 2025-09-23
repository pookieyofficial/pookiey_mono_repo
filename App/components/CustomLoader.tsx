import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Easing, StyleSheet, Text, View, ViewStyle, TextStyle } from 'react-native';
import { Colors } from '../constants/Colors';
import { SafeAreaView } from 'react-native-safe-area-context';

type StyleProp<T> = T | (T & Record<string, unknown>) | undefined;

export interface CustomLoaderProps {
    messages?: string[];
    intervalMs?: number;
    containerStyle?: StyleProp<ViewStyle>;
    textStyle?: StyleProp<TextStyle>;
}

const DEFAULT_MESSAGES = [
    'Hang on…',
    'Almost there…',
    'Wrapping things up…',
    'Just a moment…',
];

export const CustomLoader: React.FC<CustomLoaderProps> = ({
    messages = DEFAULT_MESSAGES,
    intervalMs = 1700,
    containerStyle,
    textStyle,
}) => {
    const colorPrimary = Colors.primaryBackgroundColor || Colors.primary?.red || '#6C5CE7';

    const [messageIndex, setMessageIndex] = useState(0);

    useEffect(() => {
        if (!messages?.length) return;
        const id = setInterval(() => {
            setMessageIndex((prev) => (prev + 1) % messages.length);
        }, intervalMs);
        return () => clearInterval(id);
    }, [messages, intervalMs]);

    const bars = 5;
    const durations = useMemo(() => [520, 620, 720, 620, 520], []);
    const delays = useMemo(() => [0, 90, 180, 270, 360], []);
    const animatedValues = useRef(Array.from({ length: bars }, () => new Animated.Value(0))).current;

    useEffect(() => {
        const animations = animatedValues.map((value, index) =>
            Animated.loop(
                Animated.sequence([
                    Animated.delay(delays[index]!),
                    Animated.timing(value, {
                        toValue: 1,
                        duration: durations[index]!,
                        easing: Easing.out(Easing.cubic),
                        useNativeDriver: true,
                    }),
                    Animated.timing(value, {
                        toValue: 0,
                        duration: durations[index]!,
                        easing: Easing.in(Easing.cubic),
                        useNativeDriver: true,
                    }),
                ]),
            ),
        );

        animations.forEach((a) => a.start());
        return () => animations.forEach((a) => a.stop());
    }, [animatedValues, delays, durations]);

    return (
        <SafeAreaView style={[styles.container, containerStyle]}>
            <View style={styles.wrapper}>
                <View style={styles.equalizer}>
                    {animatedValues.map((value, i) => {
                        const scaleY = value.interpolate({
                            inputRange: [0, 1],
                            outputRange: [0.55, 1.25],
                        });
                        const opacity = value.interpolate({
                            inputRange: [0, 1],
                            outputRange: [0.5, 1],
                        });
                        const translateY = value.interpolate({
                            inputRange: [0, 1],
                            outputRange: [4, -4],
                        });
                        return (
                            <Animated.View
                                key={`bar-${i}`}
                                style={[
                                    styles.bar,
                                    {
                                        backgroundColor: colorPrimary,
                                        transform: [{ scaleY }, { translateY }],
                                        opacity,
                                    },
                                ]}
                            />
                        );
                    })}
                </View>

                <Text style={[styles.message, { color: Colors.text?.secondary || '#666' }, textStyle]}>
                    {messages[messageIndex]}
                </Text>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: Colors.parentBackgroundColor || '#FFFFFF',
    },
    wrapper: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 24,
        paddingVertical: 16,
        gap: 16,
    },
    equalizer: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        justifyContent: 'center',
        gap: 10,
        paddingHorizontal: 4,
        paddingVertical: 6,
    },
    bar: {
        width: 10,
        height: 36,
        borderRadius: 6,
    },
    message: {
        fontSize: 14,
        letterSpacing: 0.2,
        opacity: 0.8,
    },
});

export default CustomLoader;


