import React, { useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Colors } from '@/constants/Colors';
import { ThemedText } from '@/components/ThemedText';
import { Ionicons } from '@expo/vector-icons';
import MainButton from '@/components/MainButton';
import { useAuth } from '@/hooks/useAuth';
import { validateReferralAPI } from '@/APIs/userAPIs';
import axios from 'axios';
import CustomBackButton from '@/components/CustomBackButton';
import { LinearGradient } from 'expo-linear-gradient';
import { useTranslation } from 'react-i18next';

export default function ReferralScreen() {
  const { t } = useTranslation();
  const { token } = useAuth();
  const [hasReferralCode, setHasReferralCode] = useState<boolean | null>(null);
  const [referralCode, setReferralCode] = useState('');
  const [isValidating, setIsValidating] = useState(false);

  const handleHasReferral = (hasCode: boolean) => {
    setHasReferralCode(hasCode);
    if (!hasCode) {
      handleContinue();
    }
  };

  const handleValidateReferral = async () => {
    if (!referralCode.trim()) {
      handleContinue();
      return;
    }

    if (isValidating) {
      return; // Prevent multiple submissions
    }

    if (!token) {
      handleContinue();
      return;
    }

    try {
      setIsValidating(true);
      const response = await axios.post(
        validateReferralAPI,
        { referralCode: referralCode.trim() },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.data.success) {
        // Silently save and continue
        handleContinue();
      } else {
        // Invalid code, just continue
        handleContinue();
      }
    } catch (error: any) {
      // Silently handle invalid referral code or errors - just continue onboarding
      // No need to log or show errors to user
      handleContinue();
    } finally {
      setIsValidating(false);
    }
  };

  const handleContinue = () => {
    router.push('/(onboarding)/gender');
  };

  const handleSkip = () => {
    setHasReferralCode(false);
    handleContinue();
  };

  return (
    <SafeAreaView style={styles.container}>
      <CustomBackButton />
      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.content}>
          {/* Gift Icon */}
          <View style={styles.iconContainer}>
            <View style={styles.iconWrapper}>
              <LinearGradient
                colors={['rgba(233, 64, 87, 0.15)', 'rgba(233, 64, 87, 0.05)']}
                style={styles.iconGradient}
              >
                <View style={styles.iconCircle}>
                  <Ionicons name="gift" size={56} color={Colors.primary.red} />
                </View>
              </LinearGradient>
              {/* Decorative circles */}
              <View style={[styles.decorativeCircle, styles.circle1]} />
              <View style={[styles.decorativeCircle, styles.circle2]} />
              <View style={[styles.decorativeCircle, styles.circle3]} />
            </View>
          </View>

          {/* Title Section */}
          <View style={styles.titleSection}>
            <ThemedText type="title" style={styles.title}>
              {t("refer.onboardingTitle")}
            </ThemedText>
            <ThemedText style={styles.subtitle}>
              Enter your friend's code to unlock special benefits and get started on your journey!
            </ThemedText>
          </View>

          {/* Options */}
          {hasReferralCode === null && (
            <View style={styles.optionsContainer}>
              <TouchableOpacity
                style={styles.optionCard}
                onPress={() => handleHasReferral(true)}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={['rgba(233, 64, 87, 0.1)', 'rgba(233, 64, 87, 0.05)']}
                  style={styles.optionGradient}
                >
                  <View style={styles.optionContent}>
                    <View style={styles.optionIconContainer}>
                      <Ionicons name="ticket" size={32} color={Colors.primary.red} />
                    </View>
                    <View style={styles.optionTextContainer}>
                      <ThemedText type="defaultSemiBold" style={styles.optionTitle}>
                        {t("refer.yesIHaveCode")}
                      </ThemedText>
                      <ThemedText style={styles.optionSubtitle}>
                        Enter your referral code
                      </ThemedText>
                    </View>
                    <Ionicons name="chevron-forward" size={24} color={Colors.primary.red} />
                  </View>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.optionCard}
                onPress={() => handleHasReferral(false)}
                activeOpacity={0.8}
              >
                <View style={styles.optionContent}>
                  <View style={[styles.optionIconContainer, styles.optionIconSecondary]}>
                    <Ionicons name="arrow-forward-circle" size={32} color={Colors.text.secondary} />
                  </View>
                  <View style={styles.optionTextContainer}>
                    <ThemedText type="defaultSemiBold" style={styles.optionTitleSecondary}>
                      {t("refer.noSkipStep")}
                    </ThemedText>
                    <ThemedText style={styles.optionSubtitle}>
                      Continue without a code
                    </ThemedText>
                  </View>
                  <Ionicons name="chevron-forward" size={24} color={Colors.text.tertiary} />
                </View>
              </TouchableOpacity>
            </View>
          )}

          {/* Referral Code Input */}
          {hasReferralCode === true && (
            <View style={styles.inputContainer}>
              <View style={styles.inputHeader}>
                <Ionicons name="ticket-outline" size={24} color={Colors.primary.red} />
                <ThemedText type="defaultSemiBold" style={styles.inputLabel}>
                  {t("refer.enterYourReferralCode")}
                </ThemedText>
              </View>

              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.input}
                  placeholder={t("refer.codePlaceholder")}
                  placeholderTextColor={Colors.text.tertiary}
                  value={referralCode}
                  onChangeText={(text) => {
                    setReferralCode(text.replace(/[^A-Za-z0-9]/g, ''));
                  }}
                  autoCapitalize="none"
                  autoCorrect={false}
                  maxLength={6}
                  editable={!isValidating}
                />
                {isValidating && (
                  <View style={styles.statusContainer}>
                    <Ionicons name="hourglass-outline" size={24} color={Colors.primary.red} />
                  </View>
                )}
              </View>

              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={[
                    styles.validateButton,
                    (referralCode.length !== 6 || isValidating) && styles.validateButtonDisabled
                  ]}
                  onPress={handleValidateReferral}
                  disabled={referralCode.length !== 6 || isValidating}
                  activeOpacity={0.8}
                >
                  <ThemedText type="defaultSemiBold" style={[
                    styles.validateButtonText,
                    (referralCode.length !== 6 || isValidating) && styles.validateButtonTextDisabled
                  ]}>
                    {isValidating ? 'Validating...' : 'Continue'}
                  </ThemedText>
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={styles.skipButton}
                onPress={handleSkip}
                activeOpacity={0.7}
              >
                <ThemedText style={styles.skipText}>{t("refer.skipForNow")}</ThemedText>
              </TouchableOpacity>
            </View>
          )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFBFC',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
    flexGrow: 1,
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 32,
    marginTop: 20,
  },
  iconWrapper: {
    position: 'relative',
    width: 140,
    height: 140,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconGradient: {
    width: 140,
    height: 140,
    borderRadius: 70,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.primary.red,
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  iconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.primary.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  decorativeCircle: {
    position: 'absolute',
    borderRadius: 50,
    backgroundColor: 'rgba(233, 64, 87, 0.1)',
  },
  circle1: {
    width: 60,
    height: 60,
    top: -10,
    right: -10,
  },
  circle2: {
    width: 40,
    height: 40,
    bottom: -5,
    left: -5,
  },
  circle3: {
    width: 30,
    height: 30,
    top: 20,
    left: -20,
  },
  titleSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    color: Colors.titleColor,
    textAlign: 'center',
    marginBottom: 16,
    fontSize: 32,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.text.secondary,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 10,
  },
  optionsContainer: {
    gap: 16,
  },
  optionCard: {
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  optionGradient: {
    borderRadius: 20,
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    backgroundColor: Colors.primary.white,
  },
  optionIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(233, 64, 87, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  optionIconSecondary: {
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
  },
  optionTextContainer: {
    flex: 1,
  },
  optionTitle: {
    color: Colors.titleColor,
    fontSize: 18,
    marginBottom: 4,
  },
  optionTitleSecondary: {
    color: Colors.titleColor,
    fontSize: 18,
    marginBottom: 4,
  },
  optionSubtitle: {
    fontSize: 14,
    color: Colors.text.secondary,
  },
  inputContainer: {
    marginTop: 20,
  },
  inputHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 10,
  },
  inputLabel: {
    fontSize: 18,
    color: Colors.titleColor,
  },
  inputWrapper: {
    position: 'relative',
    marginBottom: 12,
  },
  input: {
    backgroundColor: Colors.primary.white,
    borderRadius: 16,
    padding: 20,
    fontSize: 24,
    color: Colors.titleColor,
    borderWidth: 2,
    borderColor: '#E8E8E8',
    fontFamily: 'HellixBold',
    letterSpacing: 4,
    textAlign: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statusContainer: {
    position: 'absolute',
    right: 20,
    top: '50%',
    transform: [{ translateY: -14 }],
  },
  buttonContainer: {
    marginTop: 8,
    marginBottom: 16,
  },
  validateButton: {
    backgroundColor: Colors.primaryBackgroundColor,
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.primaryBackgroundColor,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  validateButtonDisabled: {
    backgroundColor: '#E5E7EB',
    shadowOpacity: 0,
    elevation: 0,
  },
  validateButtonText: {
    color: Colors.primary.white,
  },
  validateButtonTextDisabled: {
    color: '#9CA3AF',
  },
  skipButton: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  skipText: {
    fontSize: 16,
    color: Colors.text.secondary,
  },
});
