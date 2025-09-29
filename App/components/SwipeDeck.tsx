import React, { useCallback, useEffect, useRef } from 'react';
import { Dimensions, Image, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { runOnJS, useAnimatedStyle, useSharedValue, withSpring, withTiming, interpolate, Extrapolation } from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '../constants/Colors';
import { ThemedText } from './ThemedText';
import { Heart, Star, Plus, } from 'react-native-feather'
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export type CardItem = any

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
    const current = data[0];
    const next = data[1];
    const third = data[2];

    // Keep last known secondary cards to avoid flicker during rapid swipes/fetch
    const lastNextRef = useRef<CardItem | null>(null);
    if (next) lastNextRef.current = next;
    const visualNext = next || lastNextRef.current;

    const translateX = useSharedValue(0);
    const translateY = useSharedValue(0);
    const rotateZ = useSharedValue(0);
    const nextScale = useSharedValue(0.96);
    const nextTranslateY = useSharedValue(-25);


    const calculateAge = (dateOfBirth: Date) => {
        const today = new Date();
        const birthDate = new Date(dateOfBirth);
        console.log(birthDate)

        const age = today.getFullYear() - birthDate.getFullYear();
        console.log(age)
        return age;
    }

    const resetCard = () => {
        translateX.value = withSpring(0);
        translateY.value = withSpring(0);
        rotateZ.value = withSpring(0);
        nextScale.value = withSpring(0.96);
        nextTranslateY.value = withSpring(-22);
    };

    const advance = (action: SwipeAction) => {
        if (!current) return;
        onSwiped?.(current, action);
    };

    const pan = Gesture.Pan()
        .onBegin(() => { })
        .onStart(() => { })
        .onUpdate((e) => {
            translateX.value = e.translationX;
            translateY.value = e.translationY;
            rotateZ.value = translateX.value * 0.0009;
            nextScale.value = 0.96 + Math.min(Math.abs(translateX.value) / (SCREEN_WIDTH * 1.8), 0.06);
            nextTranslateY.value = -22 + Math.min(Math.abs(translateX.value) / 10, 10);
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
                // Promote next card smoothly while current animates out
                nextScale.value = withTiming(1, { duration: 260 });
                nextTranslateY.value = withTiming(0, { duration: 260 });
            } else {
                translateX.value = withSpring(0);
                translateY.value = withSpring(0);
                rotateZ.value = withSpring(0);
                nextScale.value = withSpring(0.96);
                nextTranslateY.value = withSpring(-22);
            }
        });

    // When current card changes (data[0]), reset transforms for the new layout
    useEffect(() => {
        translateX.value = 0;
        translateY.value = 0;
        rotateZ.value = 0;
        nextScale.value = 0.96;
        nextTranslateY.value = -22;
    }, [current?.id, current?._id]);

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

    // Overlays - appear animations based on swipe direction
    const likeOpacityStyle = useAnimatedStyle(() => ({
        opacity: interpolate(translateX.value, [0, SWIPE_THRESHOLD_X], [0, 1], Extrapolation.CLAMP),
        transform: [{ scale: interpolate(translateX.value, [0, SWIPE_THRESHOLD_X], [0.9, 1], Extrapolation.CLAMP) }]
    }));

    const dislikeOpacityStyle = useAnimatedStyle(() => ({
        opacity: interpolate(translateX.value, [-SWIPE_THRESHOLD_X, 0], [1, 0], Extrapolation.CLAMP),
        transform: [{ scale: interpolate(translateX.value, [-SWIPE_THRESHOLD_X, 0], [1, 0.9], Extrapolation.CLAMP) }]
    }));

    const superLikeOpacityStyle = useAnimatedStyle(() => ({
        opacity: interpolate(translateY.value, [-SWIPE_THRESHOLD_Y, 0], [1, 0], Extrapolation.CLAMP),
        transform: [{ scale: interpolate(translateY.value, [-SWIPE_THRESHOLD_Y, 0], [1, 0.9], Extrapolation.CLAMP) }]
    }));

    const overlayColorStyle = useAnimatedStyle(() => {
        const likeProgress = interpolate(translateX.value, [0, SWIPE_THRESHOLD_X], [0, 0.7], Extrapolation.CLAMP);
        const dislikeProgress = interpolate(translateX.value, [-SWIPE_THRESHOLD_X, 0], [0.7, 0], Extrapolation.CLAMP);
        const superLikeProgress = interpolate(translateY.value, [-SWIPE_THRESHOLD_Y, 0], [0.7, 0], Extrapolation.CLAMP);

        // Choose dominant overlay per axis
        let bg = 'transparent';
        if (superLikeProgress > likeProgress && superLikeProgress > dislikeProgress) {
            bg = `rgba(59, 130, 246, ${superLikeProgress})`; // blue-ish for superlike
        } else if (likeProgress >= dislikeProgress) {
            bg = `rgba(34, 197, 94, ${likeProgress})`; // green-ish for like
        } else {
            bg = `rgba(239, 68, 68, ${dislikeProgress})`; // red-ish for dislike
        }
        return { backgroundColor: bg };
    });

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

                {/* Third Card (background, subtle) */}
                {third && (
                    <Animated.View style={[styles.card, styles.thirdCard, { transform: [{ scale: 0.94 }, { translateY: -28 }] }] }>
                        <Image
                            source={third?.profile?.photos?.[0]?.url
                                ? { uri: third.profile.photos[0].url }
                                : require('@/assets/images/loginPageImage.png')}
                            resizeMode="cover"
                            style={styles.image} />

                        <LinearGradient
                            colors={['transparent', 'rgba(0,0,0,0.55)']}
                            style={styles.gradient}
                        />

                        <View style={styles.footer}>
                            <ThemedText type='bold' style={styles.name}>
                                {third?.displayName}, {calculateAge(third?.profile?.dateOfBirth)}
                            </ThemedText>
                            {third?.profile?.occupation ? (
                                <ThemedText type='default' style={styles.job}>
                                    {third?.profile?.occupation}
                                </ThemedText>
                            ) : null}
                        </View>
                    </Animated.View>
                )}

                {/* Next Card */}
                {visualNext && (
                    <Animated.View style={[styles.card, styles.nextCard, nextStyle]}>
                        <Image
                            source={visualNext?.profile?.photos?.[0]?.url
                                ? { uri: visualNext.profile.photos[0].url }
                                : require('@/assets/images/loginPageImage.png')}
                            resizeMode="cover"
                            style={styles.image} />

                        <LinearGradient
                            colors={['transparent', 'rgba(0,0,0,0.7)']}
                            style={styles.gradient}
                        />

                        <View style={styles.footer}>

                            <ThemedText type='bold' style={styles.name}>
                                {visualNext?.displayName}, {calculateAge(visualNext?.profile?.dateOfBirth)}
                            </ThemedText>

                            {visualNext?.profile?.occupation
                                ?
                                <ThemedText type='default' style={styles.job}>
                                    {visualNext?.profile?.occupation}
                                </ThemedText>
                                :
                                null}

                        </View>
                    </Animated.View>
                )}


                {/* Current Card */}
                <GestureDetector gesture={pan}>
                    <Animated.View style={[styles.card, currentStyle]}>

                        <Image
                            source={current?.profile?.photos?.[0]?.url
                                ? { uri: current.profile.photos[0].url }
                                : require('@/assets/images/loginPageImage.png')}
                            resizeMode="cover"
                            style={styles.image} />

                        {/* Action color overlay */}
                        <Animated.View pointerEvents="none" style={[styles.overlayFill, overlayColorStyle]} />

                        <LinearGradient
                            colors={['transparent', 'rgba(0,0,0,0.7)']}
                            style={styles.gradient}
                        />

                        <View style={styles.footer}>

                            <ThemedText type='bold' style={styles.name}>
                                {current?.displayName}, {calculateAge(current?.profile?.dateOfBirth)}
                            </ThemedText>

                            {current?.profile?.occupation
                                ?
                                <ThemedText type='default' style={styles.job}>
                                    {current?.profile?.occupation}
                                </ThemedText>
                                : null
                            }
                        </View>

                        {/* Like badge (right swipe) */}
                        <Animated.View pointerEvents="none" style={[styles.badgeLike, likeOpacityStyle]}>
                            <Heart width={24} height={24} color="#10B981" />
                        </Animated.View>

                        {/* Dislike badge (left swipe) */}
                        <Animated.View pointerEvents="none" style={[styles.badgeDislike, dislikeOpacityStyle]}>
                            <Plus width={24} height={24} color="#EF4444" style={{ transform: [{ rotate: '45deg' }] }} />
                        </Animated.View>

                        {/* Superlike badge (up swipe) */}
                        <Animated.View pointerEvents="none" style={[styles.badgeSuperLike, superLikeOpacityStyle]}>
                            <Star width={24} height={24} color="#3B82F6" />
                        </Animated.View>

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

            {/* Like Button */}
            <View style={[styles.actionBtn, styles.shadowSm]}>
                <ThemedText onPress={onLeft}>
                    <Plus style={{ transform: [{ rotate: '45deg' }] }} strokeWidth={4} width={ACTION_BUTTON_LOGO_SIZE - 5} height={ACTION_BUTTON_LOGO_SIZE - 5} color="orange" />
                </ThemedText>
            </View>

            {/* Dislike Button */}
            <View style={[styles.actionBtnLg, styles.shadowLg, { backgroundColor: accent }]}>
                <ThemedText type='title' onPress={onRight}>
                    <Heart fill={'white'} width={ACTION_BUTTON_LOGO_SIZE + 5} height={ACTION_BUTTON_LOGO_SIZE + 5} color="white" />
                </ThemedText>
            </View>

            {/* Super Like Button */}
            <View style={[styles.actionBtn, styles.shadowSm]}>
                <ThemedText onPress={onUp} >
                    <Star fill={Colors.primaryBackgroundColor} strokeWidth={4} width={ACTION_BUTTON_LOGO_SIZE - 10} height={ACTION_BUTTON_LOGO_SIZE - 10} color={Colors.primaryBackgroundColor} />
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
        height: 60,
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
    thirdCard: {
        zIndex: -1,
        opacity: 0.95,
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
    overlayFill: {
        ...StyleSheet.absoluteFillObject,
    },
    badgeLike: {
        position: 'absolute',
        top: 16,
        right: 16,
        backgroundColor: 'rgba(16, 185, 129, 0.12)',
        paddingHorizontal: 10,
        paddingVertical: 8,
        borderRadius: 999,
    },
    badgeDislike: {
        position: 'absolute',
        top: 16,
        left: 16,
        backgroundColor: 'rgba(239, 68, 68, 0.12)',
        paddingHorizontal: 10,
        paddingVertical: 8,
        borderRadius: 999,
    },
    badgeSuperLike: {
        position: 'absolute',
        top: 16,
        alignSelf: 'center',
        backgroundColor: 'rgba(59, 130, 246, 0.12)',
        paddingHorizontal: 10,
        paddingVertical: 8,
        borderRadius: 999,
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


