import React from 'react';
import { View, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { ThemedText } from './ThemedText';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { LinearGradient } from 'expo-linear-gradient';

interface VoiceCallUIProps {
  visible: boolean;
  isIncoming: boolean;
  isConnected: boolean;
  isRinging: boolean;
  userName?: string;
  userAvatar?: string;
  onAnswer?: () => void;
  onReject?: () => void;
  onEnd?: () => void;
}

export const VoiceCallUI: React.FC<VoiceCallUIProps> = ({
  visible,
  isIncoming,
  isConnected,
  isRinging,
  userName = 'User',
  userAvatar,
  onAnswer,
  onReject,
  onEnd,
}) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
    >
      <LinearGradient
        colors={['#E94057', '#FF7A7A']}
        style={styles.container}
      >
        <View style={styles.content}>
          {/* Avatar/Icon */}
          <View style={styles.avatarContainer}>
            {userAvatar ? (
              <View style={styles.avatarCircle}>
                <ThemedText style={styles.avatarText}>
                  {userName.charAt(0).toUpperCase()}
                </ThemedText>
              </View>
            ) : (
              <View style={styles.avatarCircle}>
                <Ionicons name="person" size={60} color={Colors.primary.white} />
              </View>
            )}
          </View>

          {/* Status Text */}
          <ThemedText style={styles.userName}>{userName}</ThemedText>
          <ThemedText style={styles.statusText}>
            {isConnected
              ? 'Connected'
              : isRinging
              ? isIncoming
                ? 'Incoming call...'
                : 'Ringing...'
              : 'Calling...'}
          </ThemedText>

          {/* Action Buttons */}
          <View style={styles.actionsContainer}>
            {isIncoming && !isConnected ? (
              <>
                {/* Reject Button */}
                <TouchableOpacity
                  style={[styles.actionButton, styles.rejectButton]}
                  onPress={onReject}
                >
                  <Ionicons name="call" size={28} color={Colors.primary.white} />
                </TouchableOpacity>
                {/* Answer Button */}
                <TouchableOpacity
                  style={[styles.actionButton, styles.answerButton]}
                  onPress={onAnswer}
                >
                  <Ionicons name="call" size={28} color={Colors.primary.white} />
                </TouchableOpacity>
              </>
            ) : (
              <>
                {/* End Call Button */}
                <TouchableOpacity
                  style={[styles.actionButton, styles.endButton]}
                  onPress={onEnd}
                >
                  <Ionicons name="call" size={28} color={Colors.primary.white} />
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </LinearGradient>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    padding: 40,
  },
  avatarContainer: {
    marginBottom: 30,
  },
  avatarCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  avatarText: {
    fontSize: 48,
    color: Colors.primary.white,
    fontWeight: 'bold',
  },
  userName: {
    fontSize: 28,
    color: Colors.primary.white,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  statusText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 60,
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: 40,
    alignItems: 'center',
  },
  actionButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  answerButton: {
    backgroundColor: '#4CAF50',
    transform: [{ rotate: '135deg' }],
  },
  rejectButton: {
    backgroundColor: '#FF3B30',
    transform: [{ rotate: '135deg' }],
  },
  endButton: {
    backgroundColor: '#FF3B30',
    transform: [{ rotate: '135deg' }],
  },
});

