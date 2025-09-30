import React, { useState } from 'react';
import { View, TextInput, StyleSheet, KeyboardAvoidingView, Platform, TouchableOpacity } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';

export default function LoginWithEmail() {
  const [email, setEmail] = useState('');

  const handleSendMagicLink = () => {
    // You can add your logic here
    console.log('Send magic link to:', email);
  };

  return (
    <ThemedView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        style={styles.keyboardView}
      >
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <ThemedText type="title" style={styles.title}>
              Sign In with Email
            </ThemedText>
            <ThemedText type="default" style={styles.subtitle}>
              Enter your email to receive a magic link
            </ThemedText>
          </View>

          {/* Email Input */}
          <View style={styles.inputContainer}>
            <IconSymbol 
              name="paperplane.fill" 
              size={20} 
              color={Colors.iconsColor} 
              style={styles.inputIcon}
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

          {/* Send Magic Link Button */}
          <TouchableOpacity 
            style={[
              styles.button,
              { backgroundColor: email ? Colors.primaryBackgroundColor : Colors.text?.light }
            ]}
            onPress={handleSendMagicLink}
            disabled={!email}
            activeOpacity={0.8}
          >
            <ThemedText type="bold" style={styles.buttonText}>
              Send Magic Link
            </ThemedText>
          </TouchableOpacity>

          {/* Footer */}
          <View style={styles.footer}>
            <ThemedText type="default" style={styles.footerText}>
              We'll send you a secure link to sign in
            </ThemedText>
          </View>
        </View>
      </KeyboardAvoidingView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.parentBackgroundColor,
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.titleColor,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: Colors.text?.secondary,
    textAlign: 'center',
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
  button: {
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    shadowColor: Colors.primaryBackgroundColor,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonText: {
    fontSize: 16,
    color: Colors.primary?.white,
    fontWeight: 'bold',
  },
  footer: {
    alignItems: 'center',
    paddingTop: 20,
  },
  footerText: {
    fontSize: 14,
    color: Colors.text?.secondary,
    textAlign: 'center',
    lineHeight: 20,
  },
});
