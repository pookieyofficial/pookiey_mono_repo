import { Colors } from '@/constants/Colors';
import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, ViewStyle, KeyboardAvoidingView } from 'react-native';

type TypingIndicatorProps = {
    visible?: boolean;
    style?: ViewStyle;
    color?: string;
    size?: number;
};

export default function TypingIndicator({
    visible = true,
    style,
    color = Colors.primary.red,
    size = 6,
}: TypingIndicatorProps) {
    const dot1 = useRef(new Animated.Value(0)).current;
    const dot2 = useRef(new Animated.Value(0)).current;
    const dot3 = useRef(new Animated.Value(0)).current;

    const animateDot = (dot: Animated.Value, delay: number) => {
        return Animated.loop(
            Animated.sequence([
                Animated.delay(delay),
                Animated.timing(dot, {
                    toValue: -6,
                    duration: 250,
                    useNativeDriver: true,
                }),
                Animated.timing(dot, {
                    toValue: 0,
                    duration: 250,
                    useNativeDriver: true,
                }),
            ])
        );
    };

    useEffect(() => {
        if (!visible) return;

        const anim1 = animateDot(dot1, 0);
        const anim2 = animateDot(dot2, 120);
        const anim3 = animateDot(dot3, 240);

        anim1.start();
        anim2.start();
        anim3.start();

        return () => {
            dot1.stopAnimation();
            dot2.stopAnimation();
            dot3.stopAnimation();
        };
    }, [visible]);

    if (!visible) return null;

    const dotStyle = {
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: color,
        marginHorizontal: size / 2,
    };

    return (
        <KeyboardAvoidingView style={[styles.container, style]}>
            <Animated.View style={[dotStyle, { transform: [{ translateY: dot1 }] }]} />
            <Animated.View style={[dotStyle, { transform: [{ translateY: dot2 }] }]} />
            <Animated.View style={[dotStyle, { transform: [{ translateY: dot3 }] }]} />
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        position: 'relative',
        flexDirection: 'row',
        alignItems: 'center',
        zIndex: 10000,
        paddingHorizontal: 7,
        borderRadius: 15,
        borderTopLeftRadius: 0,
        opacity: 0.5
    },
});
