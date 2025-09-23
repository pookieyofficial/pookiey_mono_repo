import React, { useCallback, useMemo, useRef, useState } from 'react';
import { Dimensions, Image, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { runOnJS, useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '../constants/Colors';
import { ThemedText } from './ThemedText';
import AntDesign from '@expo/vector-icons/AntDesign';
import { Feather } from '@expo/vector-icons';
import { Home, Heart, Star, Plus } from 'react-native-feather'
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export type CardItem = {
    id: string | number;
    name: string;
    age: number;
    job?: string;
    image: any;
};

export type SwipeAction = 'left' | 'right' | 'up';

export interface SwipeDeckProps {
    data: CardItem[];
    onSwiped?: (item: CardItem, action: SwipeAction) => void;
}

const SWIPE_THRESHOLD_X = SCREEN_WIDTH * 0.25;
const SWIPE_THRESHOLD_Y = SCREEN_HEIGHT * 0.18;
const ACTION_BUTTON_LOGO_SIZE = 30;

export const SwipeDeck: React.FC<SwipeDeckProps> = ({ data, onSwiped }) => {
    const insets = useSafeAreaInsets();
    const [index, setIndex] = useState(0);
    const current = data[index];
    const next = data[index + 1];

    const translateX = useSharedValue(0);
    const translateY = useSharedValue(0);
    const rotateZ = useSharedValue(0);
    const nextScale = useSharedValue(0.96);
    const nextTranslateY = useSharedValue(14);

    const resetCard = () => {
        translateX.value = withSpring(0);
        translateY.value = withSpring(0);
        rotateZ.value = withSpring(0);
        nextScale.value = withSpring(0.96);
        nextTranslateY.value = withSpring(14);
    };

    const advance = (action: SwipeAction) => {
        if (!current) return;
        onSwiped?.(current, action);
        setIndex((prev) => prev + 1);
        translateX.value = 0;
        translateY.value = 0;
        rotateZ.value = 0;
        nextScale.value = 0.96;
        nextTranslateY.value = 14;
    };

    const pan = Gesture.Pan()
        .onBegin(() => { })
        .onStart(() => { })
        .onUpdate((e) => {
            translateX.value = e.translationX;
            translateY.value = e.translationY;
            rotateZ.value = translateX.value * 0.0009;
            nextScale.value = 0.96 + Math.min(Math.abs(translateX.value) / (SCREEN_WIDTH * 1.8), 0.06);
            nextTranslateY.value = 14 - Math.min(Math.abs(translateX.value) / 10, 10);
        })
        .onEnd(() => {
            const shouldSwipeRight = translateX.value > SWIPE_THRESHOLD_X;
            const shouldSwipeLeft = translateX.value < -SWIPE_THRESHOLD_X;
            const shouldSwipeUp = translateY.value < -SWIPE_THRESHOLD_Y;

            if (shouldSwipeRight || shouldSwipeLeft || shouldSwipeUp) {
                const x = shouldSwipeRight ? SCREEN_WIDTH : shouldSwipeLeft ? -SCREEN_WIDTH : 0;
                const y = shouldSwipeUp ? -SCREEN_HEIGHT : 0;
                translateX.value = withTiming(x * 1.2, { duration: 260 }, () => runOnJS(advance)(shouldSwipeRight ? 'right' : shouldSwipeLeft ? 'left' : 'up'));
                translateY.value = withTiming(y * 1.2, { duration: 260 });
                rotateZ.value = withTiming((shouldSwipeRight ? 1 : -1) * 0.15, { duration: 260 });
            } else {
                translateX.value = withSpring(0);
                translateY.value = withSpring(0);
                rotateZ.value = withSpring(0);
                nextScale.value = withSpring(0.96);
                nextTranslateY.value = withSpring(14);
            }
        });

    const currentStyle = useAnimatedStyle(() => ({
        transform: [
            { translateX: translateX.value },
            { translateY: translateY.value },
            { rotateZ: `${rotateZ.value}rad` },
        ],
    }));

    const nextStyle = useAnimatedStyle(() => ({
        transform: [
            { scale: nextScale.value },
            { translateY: nextTranslateY.value },
        ],
        opacity: current ? 1 : 0,
    }));

    const triggerSwipe = useCallback((action: SwipeAction) => {
        if (!current) return;
        if (action === 'right') {
            translateX.value = withTiming(SCREEN_WIDTH * 1.2, { duration: 240 }, () => runOnJS(advance)('right'));
            rotateZ.value = withTiming(0.15, { duration: 240 });
        } else if (action === 'left') {
            translateX.value = withTiming(-SCREEN_WIDTH * 1.2, { duration: 240 }, () => runOnJS(advance)('left'));
            rotateZ.value = withTiming(-0.15, { duration: 240 });
        } else {
            translateY.value = withTiming(-SCREEN_HEIGHT * 1.2, { duration: 240 }, () => runOnJS(advance)('up'));
        }
    }, [current]);

    if (!current) {
        return (
            <View style={styles.endContainer}>
                <TouchableOpacity onPress={() => resetCard()}>
                    <ThemedText style={styles.endText}>Reset Cards</ThemedText>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Top Section - Reserved for future top bar */}
            <View style={styles.topSection} />

            {/* Middle Section - Cards */}
            <View style={styles.middleSection}>
                {next && (
                    <Animated.View style={[styles.card, styles.nextCard, nextStyle]}>
                        <Image source={next.image} resizeMode="cover" style={styles.image} />
                        <LinearGradient
                            colors={['transparent', 'rgba(0,0,0,0.7)']}
                            style={styles.gradient}
                        />
                        <View style={styles.footer}>
                            <ThemedText type='defaultSemiBold'>{next.name}, {next.age}</ThemedText>
                            {next.job ? <ThemedText type='default'>{next.job}</ThemedText> : null}
                        </View>
                    </Animated.View>
                )}

                <GestureDetector gesture={pan}>
                    <Animated.View style={[styles.card, currentStyle]}>
                        <Image source={current.image} resizeMode="cover" style={styles.image} />
                        <LinearGradient
                            colors={['transparent', 'rgba(0,0,0,0.7)']}
                            style={styles.gradient}
                        />
                        <View style={styles.footer}>
                            <ThemedText style={styles.name}>{current.name}, {current.age}</ThemedText>
                            {current.job ? <ThemedText style={styles.job}>{current.job}</ThemedText> : null}
                        </View>
                    </Animated.View>
                </GestureDetector>
            </View>

            {/* Bottom Section - Action Buttons */}
            <View style={styles.bottomSection}>
                <ActionRow
                    onLeft={() => triggerSwipe('left')}
                    onRight={() => triggerSwipe('right')}
                    onUp={() => triggerSwipe('up')}
                />
            </View>
        </View>
    );
};

const ActionRow: React.FC<{ onLeft: () => void; onRight: () => void; onUp: () => void }> = ({ onLeft, onRight, onUp }) => {
    const accent = Colors.primaryBackgroundColor || Colors.primary?.red || '#E53E3E';
    return (
        <View style={styles.actions}>
            <View style={[styles.actionBtn, styles.shadowSm]}>
                <ThemedText onPress={onLeft}>
                    <Plus strokeWidth={2} width={ACTION_BUTTON_LOGO_SIZE - 5} height={ACTION_BUTTON_LOGO_SIZE - 5} color="orange" />
                </ThemedText>
            </View>
            <View style={[styles.actionBtnLg, styles.shadowLg, { backgroundColor: accent }]}>
                <ThemedText type='title' onPress={onRight}>
                    <Heart width={ACTION_BUTTON_LOGO_SIZE + 5} height={ACTION_BUTTON_LOGO_SIZE + 5} color="white" />
                </ThemedText>
            </View>
            <View style={[styles.actionBtn, styles.shadowSm]}>
                <ThemedText onPress={onUp} >
                    <Star strokeWidth={2} width={ACTION_BUTTON_LOGO_SIZE - 10} height={ACTION_BUTTON_LOGO_SIZE - 10} color={Colors.primaryBackgroundColor} />
                </ThemedText>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    topSection: {
        height: 60, // Reserved space for top bar
    },
    middleSection: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
    },
    card: {
        position: 'absolute',
        width: SCREEN_WIDTH * 0.85,
        height: SCREEN_HEIGHT * 0.55,
        borderRadius: 18,
        overflow: 'hidden',
        backgroundColor: 'white',
    },
    nextCard: {
        zIndex: 0,
    },
    image: {
        width: '100%',
        height: '100%',
    },
    gradient: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        height: 160,
    },
    footer: {
        position: 'absolute',
        left: 16,
        right: 16,
        bottom: 16,
    },
    name: {
        color: Colors.textColor,
        fontSize: 22,
    },
    job: {
        color: Colors.textColor,
        marginTop: 4,
    },
    bottomSection: {
        height: 120,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 20,
    },
    actions: {
        width: '100%',
        maxWidth: 300,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    actionBtn: {
        width: ACTION_BUTTON_LOGO_SIZE * 2,
        height: ACTION_BUTTON_LOGO_SIZE * 2,
        borderRadius: 32,
        backgroundColor: Colors.primary.white,
        alignItems: 'center',
        justifyContent: 'center',
    },
    actionBtnLg: {
        width: ACTION_BUTTON_LOGO_SIZE * 3,
        height: ACTION_BUTTON_LOGO_SIZE * 3,
        borderRadius: 50,
        alignItems: 'center',
        justifyContent: 'center',
    },
    shadowSm: {
        shadowColor: '#000',
        shadowOpacity: 0.15,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 4 },
        elevation: 10,
    },
    shadowLg: {
        shadowColor: '#000',
        shadowOpacity: 0.3,
        shadowRadius: 15,
        shadowOffset: { width: 0, height: 8 },
        elevation: 10,
    },
    endContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    endText: {
        color: Colors.primaryForegroundColor,
    },
});

export default SwipeDeck;


