import { ScrollView, StyleSheet, Text, View, Image, TouchableOpacity, Dimensions, Alert } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context'
import AntDesign from '@expo/vector-icons/AntDesign';
import Entypo from '@expo/vector-icons/Entypo';
import { Colors } from '@/constants/Colors';
import { Foundation } from '@expo/vector-icons';
import { ThemedText } from '@/components/ThemedText';
import { useFacebookAuth } from '@/hooks/useFacebookAuth';
import { useGoogleAuth } from '@/hooks/useGoogleAuth';

const { width } = Dimensions.get('window');

export default function Page() {
  const { loading: facebookLoading, signInWithFacebookMobile } = useFacebookAuth();
  const { loading: googleLoading, signInWithGoogleMobile } = useGoogleAuth();

  const handleFacebookSignIn = async () => {
    try {
      const result = await signInWithFacebookMobile();
      if (result.error) {
        Alert.alert('Facebook Sign In Error', result.error.message);
      } else {
      }
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred during Facebook sign in');
    }
  };

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

  const LOGO_SIZE = 27;
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
        </View>

        <View style={styles.buttonsContainer}>
          <TouchableOpacity activeOpacity={0.8} style={styles.LogInEmailContainer}>
            <View style={styles.emailIconContainer}>
              <Foundation name='mail' size={LOGO_SIZE + 5} color={Colors.primaryBackgroundColor} />
            </View>
            <View style={styles.logInwithEmailTextContainer}>
              <ThemedText type='defaultSemiBold' style={styles.logInwithEmailText}>Login with Email</ThemedText>
            </View>
          </TouchableOpacity  >

          <View style={styles.dividerContainer}>
            <View style={styles.divider} />
            <ThemedText style={styles.dividerText}>or continue with</ThemedText>
            <View style={styles.divider} />
          </View>

          <View style={styles.OauthbuttonsContainer}>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleGoogleSignIn}
              disabled={googleLoading || facebookLoading}
            >
              <View style={[styles.OauthLogocontainer]}>
                <AntDesign name="google" size={LOGO_SIZE} color={"white"} />
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleFacebookSignIn}
              disabled={facebookLoading || googleLoading}
            >
              <View style={[styles.OauthLogocontainer]}>
                <Entypo name="facebook" size={LOGO_SIZE} color={"white"} />
              </View>
            </TouchableOpacity>
            <TouchableOpacity activeOpacity={0.8}>
              <View style={styles.OauthLogocontainer}>
                <AntDesign name="apple" size={LOGO_SIZE} color={"white"} />
              </View>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.footerContainer}>
          <ThemedText style={styles.footerText}>want to continue with </ThemedText>
          <TouchableOpacity activeOpacity={0.4}  >
            <ThemedText type='link' style={styles.phoneNumberText}>Phone Number?</ThemedText>
          </TouchableOpacity  >
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
  },
  images: {
    marginTop: 10, // Reduced top margin to give more space for the larger image
    marginBottom: 20, // Reduced bottom margin
    justifyContent: "center",
    paddingLeft: 15,
  },
  image: {
    width: width * 0.90, // Increased from 0.7 to 0.85 (larger image)
    height: width * 0.90, // Increased from 0.5 to 0.65 (larger image)
  },
  headingContainer: {
    marginBottom: 30, // Slightly reduced to accommodate larger image
  },
  mainHeading: {
    fontSize: 24,
    textAlign: "center",
    fontWeight: "700",
    color: Colors.titleColor,
  },
  buttonsContainer: {
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  LogInEmailContainer: {
    backgroundColor: Colors.primaryBackgroundColor,
    height: 60,
    width: '80%',
    maxWidth: 350,
    borderRadius: 30,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    marginBottom: 30,
    shadowColor: Colors.primaryBackgroundColor,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: Colors.opacity.buttonShadow,
    shadowRadius: 10,
    elevation: 6,

  },
  emailIconContainer: {
    backgroundColor: "white",
    borderRadius: 50,
    height: 40,
    width: 40,
    color: "white",
    fontWeight: 700,
    alignItems: "center",
    justifyContent: "center",
    fontSize: 40
  },
  logInwithEmailTextContainer: {
    flex: 1,
    alignItems: "center",
  },
  logInwithEmailText: {
    fontSize: 18,
    color: Colors.textColor,
    fontWeight: "600",
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    maxWidth: 350,
    marginBottom: 30,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: '#DDD',
  },
  dividerText: {
    marginHorizontal: 10,
    color: '#888',
    fontSize: 14,
  },
  OauthbuttonsContainer: {
    backgroundColor: Colors.parentBackgroundColor,
    height: 60,
    width: '100%',
    maxWidth: 350,
    borderRadius: 30,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    paddingHorizontal: 10,

  },
  OauthButton: {
    padding: 45,
  },
  buttonPressed: {
    opacity: 0.7,
  },
  OauthLogocontainer: {
    backgroundColor: Colors.primaryBackgroundColor,
    borderRadius: "50%",
    height: 55,
    width: 55,
    alignItems: "center",
    justifyContent: "center",
  },
  footerContainer: {
    flexDirection: 'row',
    marginTop: 30,
    alignItems: 'center',
  },
  footerText: {
    color: '#666',
    fontSize: 16,
  },
  phoneNumberText: {
    color: Colors.primaryBackgroundColor,
    fontSize: 14,
    fontWeight: '600',
  },
}); 