import { ScrollView, StyleSheet, Text, View, Image, TouchableOpacity, Dimensions, Alert } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context'
import AntDesign from '@expo/vector-icons/AntDesign';
import { Colors } from '@/constants/Colors';
import { Foundation } from '@expo/vector-icons';
import { ThemedText } from '@/components/ThemedText';
import { useGoogleAuth } from '@/hooks/useGoogleAuth';
import CustomLoader from '@/components/CustomLoader';
import { useRouter } from 'expo-router';
import { useDeepLinkProcessing } from '@/hooks/useDeepLinkProcessing';

const { width } = Dimensions.get('window');

export default function Page() {
  const router = useRouter()
  const { loading: googleLoading, signInWithGoogleMobile } = useGoogleAuth();
  const isDeepLinkProcessing = useDeepLinkProcessing();

  const handleGoogleSignIn = async () => {
    try {
      const result = await signInWithGoogleMobile();
      if (result.error) {
        Alert.alert('Google Sign In Error', result.error.message);
      }
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred during Google sign in');
    }
  };

  if (googleLoading)
    return (
      <CustomLoader messages={["Logging you in..", "Almost there..", "Wrapping up..", "Hang in there.."]} />
    )

  if (isDeepLinkProcessing) {
    return (
      <CustomLoader messages={["Just a moment.."]} />
    )
  }

  return (
    <SafeAreaView style={styles.container}>

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.images}>
          <Image
            source={require('../../assets/images/loginPageImage.png')}
            style={styles.image}
            resizeMode="contain"
          />
        </View>

        <View style={styles.headingContainer}>
          <ThemedText type='title' style={styles.mainHeading}>
            Swipe, Match, Connect
          </ThemedText>
          <ThemedText type='title' style={styles.mainHeading}>
            Discover True Bonds
          </ThemedText>
          <ThemedText style={styles.subHeading}>
            Sign in to start your journey
          </ThemedText>
        </View>

        <View style={styles.buttonsContainer}>
          {/* Primary Button - Google Sign In */}
          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.googleButton}
            onPress={handleGoogleSignIn}
            disabled={googleLoading}
          >
            <View style={styles.googleIconContainer}>
              <AntDesign name="google" size={24} color={Colors.primaryBackgroundColor} />
            </View>
            <View style={styles.googleTextContainer}>
              <ThemedText type='defaultSemiBold' style={styles.googleButtonText}>
                Continue with Google
              </ThemedText>
            </View>
          </TouchableOpacity>

          <View style={styles.dividerContainer}>
            <View style={styles.divider} />
            <ThemedText style={styles.dividerText}>or</ThemedText>
            <View style={styles.divider} />
          </View>

          {/* Secondary Button - Email Sign In */}
          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.emailButton}
            onPress={() => router.push('/(auth)/loginwithEmail')}
            disabled={googleLoading}
          >
            <View style={styles.emailIconContainer}>
              <Foundation name='mail'
                size={24} color={Colors.primaryBackgroundColor}
              />
            </View>
            <View style={styles.emailTextContainer}>
              <ThemedText type='defaultSemiBold' style={styles.emailButtonText}>
                Continue with Email
              </ThemedText>
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.footerContainer}>
          <ThemedText style={styles.footerText}>
            By continuing, you agree to our Terms of Service and Privacy Policy
          </ThemedText>
        </View>
      </ScrollView>
      <StatusBar style="auto" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.parentBackgroundColor,
  },
  scrollContainer: {
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 20,
    paddingHorizontal: 20,
  },
  images: {
    marginBottom: 30,
    justifyContent: "center",
    alignItems: "center",
  },
  image: {
    width: width * 0.55,
    height: width * 0.55,
  },
  headingContainer: {
    marginBottom: 30,
    paddingHorizontal: 20,
  },
  mainHeading: {
    fontSize: 26,
    textAlign: "center",
    color: Colors.titleColor,
  },
  subHeading: {
    fontSize: 15,
    textAlign: "center",
    color: Colors.text?.secondary,
    marginVertical: 20,
  },
  buttonsContainer: {
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  // Primary Google Button
  googleButton: {
    backgroundColor: Colors.primaryBackgroundColor,
    height: 56,
    width: '100%',
    maxWidth: 380,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
  },
  googleIconContainer: {
    backgroundColor: Colors.primary.white,
    borderRadius: 8,
    height: 40,
    width: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  googleTextContainer: {
    flex: 1,
    alignItems: "center",
  },
  googleButtonText: {
    fontSize: 16,
    color: Colors.primary.white,
    fontWeight: "600",
  },
  // Divider
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    maxWidth: 380,
    marginVertical: 20,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: '#e0e0e0',
  },
  dividerText: {
    marginHorizontal: 16,
    color: '#999',
    fontSize: 14,
    fontWeight: '500',
  },
  // Secondary Email Button
  emailButton: {
    backgroundColor: Colors.primary.white,
    height: 56,
    width: '100%',
    maxWidth: 380,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    borderWidth: 1.5,
    borderColor: Colors.primaryBackgroundColor,
    justifyContent: "center",
  },
  emailIconContainer: {
    backgroundColor: Colors.primary.white,
    borderRadius: 8,
    height: 40,
    width: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  emailTextContainer: {
    flex: 1,
    alignItems: "center",
  },
  emailButtonText: {
    fontSize: 16,
    color: Colors.primaryBackgroundColor,
    fontWeight: "600",
  },
  // Footer
  footerContainer: {
    marginTop: 40,
    paddingHorizontal: 40,
  },
  footerText: {
    color: Colors.text?.secondary,
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
  },
}); 