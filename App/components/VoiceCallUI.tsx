import React from 'react';
import { View, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { ThemedText } from './ThemedText';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { LinearGradient } from 'expo-linear-gradient';
import { Image } from 'expo-image';

interface VoiceCallUIProps {
  visible: boolean;
  isIncoming: boolean;
  isConnected: boolean;
  isRinging: boolean;
  userName?: string;
  userAvatar?: string;
  isMuted?: boolean;
  onToggleMute?: () => void;
  isSpeakerOn?: boolean;
  onAudioDevicePress?: () => void;
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
  isMuted = false,
  onToggleMute,
  isSpeakerOn = false,
  onAudioDevicePress,
  onAnswer,
  onReject,
  onEnd,
}) => {
  const statusText = isConnected
    ? 'Connected'
    : isRinging
      ? isIncoming
        ? 'Incoming call...'
        : 'Ringing...'
      : 'Calling...';

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={() => {
        // Android back button: don't just hide the UI while keeping the call alive.
        if (isIncoming && !isConnected) {
          onReject?.();
        } else {
          onEnd?.();
        }
      }}
    >
      <LinearGradient
        // More color stops to reduce visible banding on OLED/low-bit gradients
        colors={['#070B14', '#0B1220', '#17162A', '#2B1230', '#4A1737', '#7A1F3D']}
        locations={[0, 0.22, 0.42, 0.62, 0.82, 1]}
        style={styles.container}
      >
        <View style={styles.content}>
          {/* Top: Name + status */}
          <View style={styles.topBar}>
            <ThemedText style={styles.userName} numberOfLines={1}>
              {userName}
            </ThemedText>
            <ThemedText style={styles.statusText}>{statusText}</ThemedText>
          </View>

          {/* Middle: Avatar */}
          <View style={styles.middleSection}>
            <View style={styles.avatarCircle}>
              {userAvatar ? (
                <Image source={{ uri: userAvatar }} style={styles.avatarImage} contentFit="cover" />
              ) : (
                <ThemedText style={styles.avatarText}>
                  {userName?.trim()?.charAt(0)?.toUpperCase() || 'U'}
                </ThemedText>
              )}
            </View>
          </View>

          {/* Bottom: Controls */}
          <View style={styles.bottomControls}>
            {isIncoming && !isConnected ? (
              // Incoming: show reject/answer centered
              <View style={styles.centerRow}>
                <TouchableOpacity style={[styles.fab, styles.fabReject]} onPress={onReject}>
                  <Ionicons name="call" size={26} color={Colors.primary.white} />
                </TouchableOpacity>
                <TouchableOpacity style={[styles.fab, styles.fabAnswer]} onPress={onAnswer}>
                  <Ionicons name="call" size={26} color={Colors.primary.white} />
                </TouchableOpacity>
              </View>
            ) : (
              // Outgoing/connected: keep mic + hangup together in center
              <View style={styles.centerRow}>
                {isConnected ? (
                  <TouchableOpacity
                    style={[styles.controlButton, isMuted ? styles.muteOn : styles.muteOff]}
                    onPress={onToggleMute}
                  >
                    <Ionicons
                      name={'mic-off'}
                      size={22}
                      color={isMuted ? '#EF4444' : Colors.primary.white}
                    />
                  </TouchableOpacity>
                ) : null}

                <TouchableOpacity style={[styles.fab, styles.fabEnd]} onPress={onEnd}>
                  <Ionicons name="call" size={26} color={Colors.primary.white} />
                </TouchableOpacity>

                {isConnected ? (
                  <TouchableOpacity
                    style={[styles.controlButton, isSpeakerOn ? styles.speakerOn : styles.speakerOff]}
                    onPress={onAudioDevicePress}
                  >
                    <Ionicons
                      name={'volume-high'}
                      size={22}
                      color={isSpeakerOn ? '#EF4444' : Colors.primary.white}
                    />
                  </TouchableOpacity>
                ) : null}
              </View>
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
    flex: 1,
    width: '100%',
    paddingHorizontal: 24,
    paddingTop: 52,
    paddingBottom: 40,
    justifyContent: 'space-between',
  },
  topBar: {
    alignItems: 'center',
    paddingHorizontal: 12,
    marginTop: 30,
  },
  middleSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(255, 255, 255, 0.10)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.18)',
  },
  avatarImage: {
    width: 140,
    height: 140,
    borderRadius: 70,
  },
  avatarText: {
    fontSize: 48,
    color: Colors.primary.white,
    fontWeight: 'bold',
  },
  userName: {
    fontSize: 30,
    color: Colors.primary.white,
    fontWeight: '700',
    marginBottom: 6,
  },
  statusText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.78)',
  },
  bottomControls: {
    alignItems: 'center',
    paddingBottom: 40,
  },
  centerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 18,
  },
  controlButton: {
    width: 75,
    height: 75,
    borderRadius: 38,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.14)',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.30,
    shadowRadius: 18,
    elevation: 10,
  },
  muteOff: {
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
  },
  muteOn: {
    backgroundColor: '#FFFFFF',
    borderColor: 'rgba(255, 255, 255, 0.55)',
  },
  speakerOff: {
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
  },
  speakerOn: {
    backgroundColor: '#FFFFFF',
    borderColor: 'rgba(255, 255, 255, 0.55)',
  },
  controlLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.90)',
  },
  fab: {
    width: 75,
    height: 75,
    borderRadius: 38,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.30,
    shadowRadius: 18,
    elevation: 10,
  },
  fabAnswer: {
    backgroundColor: '#22C55E',
    transform: [{ rotate: '135deg' }],
  },
  fabReject: {
    backgroundColor: '#EF4444',
    transform: [{ rotate: '135deg' }],
  },
  fabEnd: {
    backgroundColor: '#EF4444',
    transform: [{ rotate: '135deg' }],
  },
});

