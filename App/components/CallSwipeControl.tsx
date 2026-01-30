import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, PanResponder, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import * as Haptics from 'expo-haptics';

interface CallSwipeControlProps {
  onAnswer: () => void;
  onReject: () => void;
  iconName?: keyof typeof Ionicons.glyphMap;
  showVideoIcons?: boolean; // If true, shows video icons instead of call icons
}

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const SWIPE_THRESHOLD = 100; // Distance to trigger action
const CONTROL_SIZE = 75;
const HINT_SIZE = 56;

export const CallSwipeControl: React.FC<CallSwipeControlProps> = ({
  onAnswer,
  onReject,
  iconName = 'call',
  showVideoIcons = false,
}) => {
  const pan = useRef(new Animated.ValueXY()).current;
  const jumpAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const hintOpacity = useRef(new Animated.Value(0.6)).current;

  // Subtle jumping animation to hint at interactivity
  useEffect(() => {
    const jumpAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(jumpAnim, {
          toValue: -8,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(jumpAnim, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.delay(1200),
      ])
    );

    // Pulse hint icons
    const hintAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(hintOpacity, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(hintOpacity, {
          toValue: 0.4,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    );

    jumpAnimation.start();
    hintAnimation.start();

    return () => {
      jumpAnimation.stop();
      hintAnimation.stop();
    };
  }, [jumpAnim, hintOpacity]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        // Stop jump animation when user touches
        jumpAnim.stopAnimation();
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        Animated.spring(scaleAnim, {
          toValue: 1.1,
          useNativeDriver: true,
        }).start();
      },
      onPanResponderMove: (_, gesture) => {
        // Only allow vertical movement
        pan.setValue({ x: 0, y: gesture.dy });

        // Provide haptic feedback when crossing threshold
        if (Math.abs(gesture.dy) > SWIPE_THRESHOLD) {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        }
      },
      onPanResponderRelease: (_, gesture) => {
        const swipedUp = gesture.dy < -SWIPE_THRESHOLD;
        const swipedDown = gesture.dy > SWIPE_THRESHOLD;

        if (swipedUp) {
          // Answer
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          Animated.timing(pan, {
            toValue: { x: 0, y: -SCREEN_HEIGHT },
            duration: 300,
            useNativeDriver: true,
          }).start(() => {
            onAnswer();
          });
        } else if (swipedDown) {
          // Reject
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
          Animated.timing(pan, {
            toValue: { x: 0, y: SCREEN_HEIGHT },
            duration: 300,
            useNativeDriver: true,
          }).start(() => {
            onReject();
          });
        } else {
          // Return to center
          Animated.spring(pan, {
            toValue: { x: 0, y: 0 },
            tension: 50,
            friction: 7,
            useNativeDriver: true,
          }).start();
          Animated.spring(scaleAnim, {
            toValue: 1,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

  const getAnswerIconName = () => {
    if (showVideoIcons) return 'videocam';
    return 'call';
  };

  const getRejectIconName = () => {
    if (showVideoIcons) return 'videocam-off';
    return 'call';
  };

  return (
    <View style={styles.container}>
      {/* Answer hint (top) */}
      <Animated.View style={[styles.hintContainer, styles.hintTop, { opacity: hintOpacity }]}>
        <View style={[styles.hintCircle, styles.hintAnswer]}>
          <Ionicons name={getAnswerIconName()} size={24} color={Colors.primary.white} />
        </View>
        <Animated.Text style={styles.hintText}>Swipe up to answer</Animated.Text>
      </Animated.View>

      {/* Draggable control */}
      <Animated.View
        {...panResponder.panHandlers}
        style={[
          styles.controlCircle,
          {
            transform: [
              { translateY: Animated.add(pan.y, jumpAnim) },
              { scale: scaleAnim },
            ],
          },
        ]}
      >
        <View style={styles.iconContainer}>
          <Ionicons name={iconName} size={32} color={Colors.primary.white} />
        </View>
      </Animated.View>

      {/* Reject hint (bottom) */}
      <Animated.View style={[styles.hintContainer, styles.hintBottom, { opacity: hintOpacity }]}>
        <Animated.Text style={styles.hintText}>Swipe down to decline</Animated.Text>
        <View style={[styles.hintCircle, styles.hintReject]}>
          <Ionicons 
            name={getRejectIconName()} 
            size={24} 
            color={Colors.primary.white}
            style={showVideoIcons ? {} : { transform: [{ rotate: '135deg' }] }}
          />
        </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 300,
  },
  controlCircle: {
    width: CONTROL_SIZE,
    height: CONTROL_SIZE,
    borderRadius: CONTROL_SIZE / 2,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 12,
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  iconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    transform: [{ rotate: '135deg' }],
  },
  hintContainer: {
    position: 'absolute',
    alignItems: 'center',
    gap: 8,
  },
  hintTop: {
    top: 0,
  },
  hintBottom: {
    bottom: 0,
  },
  hintCircle: {
    width: HINT_SIZE,
    height: HINT_SIZE,
    borderRadius: HINT_SIZE / 2,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  hintAnswer: {
    backgroundColor: '#22C55E',
  },
  hintReject: {
    backgroundColor: '#EF4444',
  },
  hintText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.85)',
    fontWeight: '500',
  },
});
