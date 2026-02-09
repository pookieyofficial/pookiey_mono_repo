import React, { useEffect, useRef } from 'react';
import { View, Animated, Easing, StyleSheet } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { Colors } from '@/constants/Colors';

type Props = {
    message?: string;
};

const SIZE = 140;

const RadarLoader: React.FC<Props> = ({ message }) => {
    const sweepAnim = useRef(new Animated.Value(0)).current;
    const pulseAnim = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        const sweep = Animated.loop(
            Animated.timing(sweepAnim, {
                toValue: 1,
                duration: 2200,
                easing: Easing.linear,
                useNativeDriver: true,
            })
        );

        const pulse = Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, {
                    toValue: 1.4,
                    duration: 900,
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: true,
                }),
                Animated.timing(pulseAnim, {
                    toValue: 1,
                    duration: 900,
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: true,
                }),
            ])
        );

        sweep.start();
        pulse.start();

        return () => {
            sweep.stop();
            pulse.stop();
        };
    }, []);

    const rotation = sweepAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '360deg'],
    });

    const circles = [1, 0.75, 0.5, 0.25];

    return (
        <View style={styles.container}>
            <View style={styles.radarWrapper}>
                {/* Grid circles */}
                {circles.map((scale, i) => (
                    <View
                        key={i}
                        style={[
                            styles.circle,
                            {
                                width: SIZE * scale,
                                height: SIZE * scale,
                                borderRadius: (SIZE * scale) / 2,
                            },
                        ]}
                    />
                ))}

                {/* Crosshair lines */}
                <View style={styles.verticalLine} />
                <View style={styles.horizontalLine} />

                {/* Rotating sweep arm */}
                <Animated.View
                    style={[
                        styles.sweepContainer,
                        {
                            transform: [{ rotate: rotation }],
                        },
                    ]}
                >
                    {/* Main sweep line */}
                    <View style={styles.sweepLine} />

                    {/* Sweep glow trail */}
                    <View style={styles.sweepTrail} />
                </Animated.View>

                {/* Center pulsing dot */}
                <Animated.View
                    style={[
                        styles.centerDot,
                        {
                            transform: [{ scale: pulseAnim }],
                        },
                    ]}
                />
            </View>

            {message && (
                <ThemedText style={styles.message}>{message}</ThemedText>
            )}
        </View>
    );
};

export default RadarLoader;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    radarWrapper: {
        width: SIZE,
        height: SIZE,
        borderRadius: SIZE / 2,
        overflow: 'hidden',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: Colors.secondaryBackgroundColor,
    },
    circle: {
        position: 'absolute',
        borderWidth: 1,
        borderColor: `${Colors.primaryBackgroundColor}40`,
    },
    verticalLine: {
        position: 'absolute',
        width: 1,
        height: SIZE,
        backgroundColor: `${Colors.primaryBackgroundColor}30`,
    },
    horizontalLine: {
        position: 'absolute',
        height: 1,
        width: SIZE,
        backgroundColor: `${Colors.primaryBackgroundColor}30`,
    },
    sweepContainer: {
        position: 'absolute',
        width: SIZE,
        height: SIZE,
        alignItems: 'center',
    },
    sweepLine: {
        position: 'absolute',
        width: 2,
        height: SIZE / 2,
        backgroundColor: Colors.primaryBackgroundColor,
        top: 0,
    },
    sweepTrail: {
        position: 'absolute',
        width: 30,
        height: SIZE / 2,
        top: 0,
        backgroundColor: `${Colors.primaryBackgroundColor}30`,
        borderTopLeftRadius: 100,
        borderTopRightRadius: 100,
    },
    centerDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: Colors.primaryBackgroundColor,
        shadowColor: Colors.primaryBackgroundColor,
        shadowOpacity: 0.9,
        shadowRadius: 8,
        elevation: 6,
    },
    message: {
        marginTop: 14,
        fontSize: 16,
        color: Colors.text.secondary,
        fontFamily: 'HellixMedium',
    },
});
