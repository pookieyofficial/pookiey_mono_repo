import React, { useEffect, useRef, useState } from 'react';
import { View, TextInput, StyleSheet, KeyboardAvoidingView, Platform, Alert, TouchableOpacity } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { Colors } from '@/constants/Colors';
import CustomBackButton from '@/components/CustomBackButton';
import MainButton from '@/components/MainButton';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Mail } from 'react-native-feather';
import { useAuth } from '@/hooks/useAuth';
import CustomLoader from '@/components/CustomLoader';
import { useDeepLinkProcessing } from '@/hooks/useDeepLinkProcessing';
import { useTranslation } from 'react-i18next';

const OTP_LENGTH = 6;

export default function LoginWithEmail() {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'EMAIL' | 'OTP'>('EMAIL');
  const [statusMessage, setStatusMessage] = useState('');
  const { signInWithLink, verifyEmailOtp, isLoading } = useAuth();
  const isDeepLinkProcessing = useDeepLinkProcessing();
  const otpInputRef = useRef<TextInput | null>(null);

  const normalizedEmail = email.trim().toLowerCase();
  const isOtpStep = step === 'OTP';

  const validateEmail = () => /\S+@\S+\.\S+/.test(normalizedEmail);

  useEffect(() => {
    if (isOtpStep) {
      otpInputRef.current?.focus();
    }
  }, [isOtpStep]);

  const handleSendOtp = async () => {
    if (!validateEmail()) {
      Alert.alert(t('auth.error'), t('auth.enterYourEmail'));
      return;
    }

    const result = await signInWithLink(normalizedEmail);

    if (result.error) {
      Alert.alert(t('auth.error'), result.error.message);
      return;
    }

    setOtp('');
    setStep('OTP');
    setStatusMessage(`Enter the 6-digit code we sent to ${normalizedEmail}.`);
    Alert.alert(
      t('auth.checkYourEmail'),
      `We just emailed a one-time code to ${normalizedEmail}.`,
      [{ text: t('auth.ok') }],
    );
  };

  const handleVerifyOtp = async () => {
    if (otp.length < OTP_LENGTH) {
      Alert.alert(t('auth.error'), 'Please enter the 6-digit code.');
      return;
    }

    const result = await verifyEmailOtp(normalizedEmail, otp);

    if (result.error) {
      Alert.alert(t('auth.error'), result.error.message);
      return;
    }

    setStatusMessage('Code verified! Finishing sign-in...');
  };

  const handleResendOtp = () => {
    if (isLoading) return;
    handleSendOtp();
  };

  const handleUseDifferentEmail = () => {
    setStep('EMAIL');
    setOtp('');
    setStatusMessage('');
  };

  const handleOtpChange = (value: string) => {
    const sanitized = value.replace(/[^0-9]/g, '').slice(0, OTP_LENGTH);
    setOtp(sanitized);
  };

  const handlePrimaryAction = () => {
    if (isOtpStep) {
      handleVerifyOtp();
    } else {
      handleSendOtp();
    }
  };

  const otpSubtitle =
    statusMessage || `Enter the 6-digit code we sent to ${normalizedEmail}.`;

  const otpDigits = Array.from({ length: OTP_LENGTH }).map((_, index) => otp[index] || '');

  if (isLoading) {
    return (
      <CustomLoader messages={[isOtpStep ? t('auth.loggingIn') : t('auth.sendingMagicLink')]} />
    )
  }

  if (isDeepLinkProcessing) {
    return (
      <CustomLoader messages={[t('auth.justAMoment')]} />
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      <CustomBackButton />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <View style={styles.content}>
          {/* Title */}
          <ThemedText type="title" style={styles.mainHeading}>
            {isOtpStep ? t('auth.checkYourEmail') : t('auth.signInWithEmail')}
          </ThemedText>

          {/* Subtitle */}
          <ThemedText type="default" style={styles.subHeading}>
            {isOtpStep ? otpSubtitle : t('auth.secureLinkMessage')}
          </ThemedText>

          {/* Email Input */}
          {!isOtpStep && (
            <View style={styles.inputContainer}>
              <Mail
                color={Colors.iconsColor}
                style={styles.inputIcon}
                width={20}
                height={20}
              />
              <TextInput
                style={styles.textInput}
                placeholder={t('auth.enterYourEmail')}
                placeholderTextColor={Colors.text?.secondary}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                textContentType="emailAddress"
              />
            </View>
          )}

          {isOtpStep && (
            <View style={styles.otpContainer}>
              <TouchableOpacity
                activeOpacity={0.9}
                onPress={() => otpInputRef.current?.focus()}
              >
                <View style={styles.otpBoxes}>
                  {otpDigits.map((digit, index) => {
                    const isActive = index === otp.length && otp.length !== OTP_LENGTH;
                    return (
                      <View
                        key={index}
                        style={[
                          styles.otpBox,
                          digit && styles.otpBoxFilled,
                          isActive && styles.otpBoxActive,
                        ]}
                      >
                        <ThemedText
                          type="title"
                          style={[
                            styles.otpDigit,
                            !digit && styles.otpDigitPlaceholder,
                          ]}
                        >
                          {digit || ''}
                        </ThemedText>
                      </View>
                    );
                  })}
                </View>
              </TouchableOpacity>
              <TextInput
                ref={otpInputRef}
                value={otp}
                onChangeText={handleOtpChange}
                keyboardType="number-pad"
                maxLength={OTP_LENGTH}
                textContentType="oneTimeCode"
                style={styles.hiddenOtpInput}
                autoFocus
              />
              <View style={styles.helperStack}>
                <View style={styles.helperRow}>
                  <TouchableOpacity onPress={handleUseDifferentEmail}>
                    <ThemedText type="default" style={styles.changeEmailText}>
                      Change email
                    </ThemedText>
                  </TouchableOpacity>

                  <TouchableOpacity onPress={handleResendOtp} disabled={isLoading}>
                    <ThemedText
                      type="defaultSemiBold"
                      style={[
                        styles.helperAction,
                        isLoading && styles.helperActionDisabled,
                      ]}
                    >
                      Resend
                    </ThemedText>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}

          {/* Footer
          <View style={styles.footer}>
            <ThemedText type="default" style={styles.footerText}>
              We'll send you a secure link to sign in
            </ThemedText>
          </View> */}

          {/* Continue Button */}
          <View style={styles.footer}>

            <MainButton
              title={isOtpStep ? 'Verify & Sign In' : t('auth.continue')}
              onPress={handlePrimaryAction}
            />
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  mainHeading: {
    fontSize: 26,
    color: Colors.titleColor,
  },
  subHeading: {
    fontSize: 16,
    color: Colors.text?.secondary,
    marginTop: 8,
    marginBottom: 32,
    lineHeight: 22,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary?.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.text?.light,
    paddingHorizontal: 16,
    paddingVertical: 4,
    marginBottom: 24,
    shadowColor: Colors.primaryBackgroundColor,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  inputIcon: {
    marginRight: 12,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: Colors.titleColor,
    paddingVertical: 16,
    fontFamily: 'HellixMedium',
  },
  footer: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingBottom: 20,
  },
  footerText: {
    fontSize: 14,
    color: Colors.text?.secondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 16,
  },
  otpContainer: {
    backgroundColor: Colors.primary?.white,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 24,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: Colors.text?.light,
    shadowColor: Colors.primaryBackgroundColor,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 6,
  },
  otpBoxes: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  otpBox: {
    flex: 1,
    aspectRatio: 0.9,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: Colors.text?.light,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary?.white,
    marginHorizontal: 6,
  },
  otpBoxFilled: {
    borderColor: Colors.primaryBackgroundColor,
    backgroundColor: `${Colors.primaryBackgroundColor}10`,
  },
  otpBoxActive: {
    borderColor: Colors.primaryBackgroundColor,
    shadowColor: Colors.primaryBackgroundColor,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 4,
  },
  otpDigit: {
    color: Colors.titleColor,
    fontFamily: 'HellixSemiBold',
    fontSize: 22,
  },
  otpDigitPlaceholder: {
    color: Colors.text?.light,
  },
  hiddenOtpInput: {
    position: 'absolute',
    opacity: 0,
    height: 0,
    width: 0,
  },
  helperStack: {
    marginTop: 20,
  },
  helperRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  helperText: {
    color: Colors.text?.secondary,
    fontSize: 14,
  },
  helperAction: {
    color: Colors.primaryBackgroundColor,
    fontSize: 14,
  },
  helperActionDisabled: {
    opacity: 0.5,
  },
  changeEmailText: {
    color: Colors.text?.secondary,
    fontSize: 14,
    textAlign: 'center',
    marginTop: 12,
  },
});
