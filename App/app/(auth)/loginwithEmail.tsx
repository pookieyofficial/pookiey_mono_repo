import React, { useState } from 'react';
import { View, TextInput, StyleSheet, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { Colors } from '@/constants/Colors';
import CustomBackButton from '@/components/CustomBackButton';
import MainButton from '@/components/MainButton';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Mail } from 'react-native-feather';
import { useAuth } from '@/hooks/useAuth';
import CustomLoader from '@/components/CustomLoader';
import { useDeepLinkProcessing } from '@/hooks/useDeepLinkProcessing';

export default function LoginWithEmail() {
  const [email, setEmail] = useState('');
  const { signInWithLink, isLoading } = useAuth();
  const isDeepLinkProcessing = useDeepLinkProcessing();

  const handleContinue = async () => {
    if (!email) return;

    console.log('Send magic link to:', email);
    const result = await signInWithLink(email);

    if (result.error) {
      Alert.alert('Error', result.error.message);
    } else {
      Alert.alert(
        'Check Your Email! 📧',
        `We've sent a magic link to ${email}. Click the link to sign in.`,
        [{ text: 'OK' }]
      );
    }

    console.log('Magic link result:', result);
  };

  if (isLoading) {
    return (
      <CustomLoader messages={["Sending magic link.."]} />
    )
  }

  if (isDeepLinkProcessing) {
    return (
      <CustomLoader messages={["Just a moment.."]} />
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
          <ThemedText type="title" style={styles.mainHeading}>Sign In with Email</ThemedText>

          {/* Subtitle */}
          <ThemedText type="default" style={styles.subHeading}>
            We'll send you a secure link to sign in on this device.
          </ThemedText>

          {/* Email Input */}
          <View style={styles.inputContainer}>
            <Mail
              color={Colors.iconsColor}
              style={styles.inputIcon}
              width={20}
              height={20}
            />
            <TextInput
              style={styles.textInput}
              placeholder="Enter your email"
              placeholderTextColor={Colors.text?.secondary}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              textContentType="emailAddress"
            />
          </View>

          {/* Footer
          <View style={styles.footer}>
            <ThemedText type="default" style={styles.footerText}>
              We'll send you a secure link to sign in
            </ThemedText>
          </View> */}

          {/* Continue Button */}
          <View style={styles.footer}>

            <MainButton
              title="Continue"
              onPress={handleContinue}
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
});
