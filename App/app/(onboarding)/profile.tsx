import MainButton from '@/components/MainButton';
import { ThemedText } from '@/components/ThemedText';
import { useOnboardingStore } from '@/store/onboardingStore';
import { useAuthStore } from '@/store/authStore';
import { router } from 'expo-router';
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import LanguageSelector from '@/components/LanguageSelector';
import {
  Image,
  KeyboardAvoidingView,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
  Modal,
  TouchableWithoutFeedback,
  Platform,
  Alert,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';

// Define color scheme
const Colors = {
  primaryBackgroundColor: "#4B164C",
  secondaryBackgroundColor: "#FCF3FA",
  primaryForegroundColor: "#4B164C",
  secondaryForegroundColor: "#8E4C8F",
  buttonBackgroundColor: "#4B164C",
  buttonForegroundColor: "#FFFFFF",
  parentBackgroundColor: "#FFFFFF",
  iconsColor: "#4B164C",
  titleColor: "#1A1A1A",
  textColor: "#FFFFFF",
  inputBackgroundColor: "#F8F8F8",
  inputTextColor: "#333333",
  placeholderColor: "#888888",
  borderColor: "#E8E8E8",
  successColor: "#4ADE80",
  errorColor: "#EF4444",
};

const { width } = Dimensions.get('window');

export default function ProfileScreen() {
  const { t } = useTranslation();
  const { fullName, setFullName, birthday, setBirthday, profilePicture, setProfilePicture, setLanguage } = useOnboardingStore();
  const { dbUser } = useAuthStore();
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [tempDate, setTempDate] = useState(birthday ? new Date(birthday) : new Date());
  
  // Initialize name from provider if available, otherwise from store
  const getInitialFirstName = () => {
    if (dbUser?.displayName) {
      return dbUser.displayName.split(' ')[0] || '';
    }
    return fullName.split(' ')[0] || '';
  };

  const getInitialLastName = () => {
    if (dbUser?.displayName) {
      const parts = dbUser.displayName.split(' ');
      return parts.slice(1).join(' ') || '';
    }
    return fullName.split(' ').slice(1).join(' ') || '';
  };

  const [firstName, setFirstName] = useState(getInitialFirstName());
  const [lastName, setLastName] = useState(getInitialLastName());

  // Initialize profile picture from provider if available (only once)
  useEffect(() => {
    if (dbUser?.photoURL && !profilePicture) {
      setProfilePicture(dbUser.photoURL);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dbUser?.photoURL]);

  // Initialize name from provider on mount
  useEffect(() => {
    if (dbUser?.displayName) {
      const nameParts = dbUser.displayName.split(' ');
      setFirstName(nameParts[0] || '');
      setLastName(nameParts.slice(1).join(' ') || '');
    }
  }, [dbUser?.displayName]);

  const calculateAge = (dateOfBirth: Date): number => {
    const today = new Date();
    let age = today.getFullYear() - dateOfBirth.getFullYear();
    const monthDiff = today.getMonth() - dateOfBirth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dateOfBirth.getDate())) {
      age--;
    }
    return age;
  };

  const handleConfirm = () => {
    if (!firstName.trim() || !lastName.trim()) {
      Alert.alert(t('profile.missingInfo'), t('profile.enterBothNames'));
      return;
    }

    if (!birthday) {
      Alert.alert(t('profile.missingInfo'), t('profile.selectBirthday'));
      return;
    }

    // Validate age (must be 18+)
    const birthdayDate = new Date(birthday);
    const age = calculateAge(birthdayDate);
    
    if (age < 18) {
      Alert.alert(
        t('profile.ageRestriction'),
        t('profile.mustBe18'),
      );
      return;
    }

    setFullName(`${firstName.trim()} ${lastName.trim()}`);
    router.push('/(onboarding)/image');
  };

  const handleBirthdayChange = (event: any, selectedDate: any) => {

    // only close picker on android on user confirm click, on iOS it is default.
    Platform.OS === "android" && setShowDatePicker(false);

    if (selectedDate) {
      setTempDate(selectedDate);
      setBirthday(selectedDate.toISOString());
    }
  };

  const formatDate = (dateString: any) => {
    if (!dateString) return t('profile.chooseBirthday');

    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (status !== 'granted') {
        Alert.alert(t('profile.permissionRequired'), t('profile.cameraRollPermission'));
        return;
      }

      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled) {
        setProfilePicture(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert(t('profile.error'), t('profile.failedToSelectImage'));
    }
  };

  const takePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();

      if (status !== 'granted') {
        Alert.alert(t('profile.permissionRequired'), t('profile.cameraPermission'));
        return;
      }

      let result = await ImagePicker.launchCameraAsync({
        allowsEditing: false,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled) {
        setProfilePicture(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert(t('profile.error'), t('profile.failedToTakePhoto'));
    }
  };

  const showImagePickerOptions = () => {
    Alert.alert(
      t('profile.selectProfilePicture'),
      t('profile.chooseOption'),
      [
        {
          text: t('profile.chooseFromLibrary'),
          onPress: pickImage,
        },
        {
          text: t('profile.takePhoto'),
          onPress: takePhoto,
        },
        {
          text: t('profile.cancel'),
          style: 'cancel',
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollViewContent}
        >
          <View style={styles.content}>
            <View style={styles.header}>
              <View style={styles.languageSelectorContainer}>
                <LanguageSelector store={{ setLanguage }} />
              </View>
              <ThemedText type="title" style={styles.title}>{t('profile.title')}</ThemedText>
              <ThemedText type='subtitle' style={styles.subtitle}>{t('profile.subtitle')}</ThemedText>
            </View>

            <View style={styles.profilePictureContainer}>
              <TouchableOpacity onPress={showImagePickerOptions} style={styles.profilePictureButton}>
                <View style={styles.profilePicture}>
                  {profilePicture ? (
                    <Image
                      source={{ uri: profilePicture }}
                      style={styles.profileImage}
                    />
                  ) : (
                    <View style={styles.profileImagePlaceholder}>
                      <Ionicons name="person" size={60} color={Colors.secondaryForegroundColor} />
                    </View>
                  )}
                  <View style={styles.cameraIcon}>
                    <Ionicons name="camera" size={20} color={Colors.textColor} />
                  </View>
                </View>
              </TouchableOpacity>
              <ThemedText type='default' style={styles.profilePictureHint}>{t('profile.tapToChangePhoto')}</ThemedText>
            </View>

            <View style={styles.inputContainer}>
              <View style={styles.inputWrapper}>
                <ThemedText type='default' style={styles.inputLabel}>{t('profile.firstName')}</ThemedText>
                <TextInput
                  style={styles.textInput}
                  value={firstName}
                  onChangeText={setFirstName}
                  placeholder="David"
                  placeholderTextColor={Colors.placeholderColor}
                />
              </View>

              <View style={styles.inputWrapper}>
                <ThemedText type='default' style={styles.inputLabel}>{t('profile.lastName')}</ThemedText>
                <TextInput
                  style={styles.textInput}
                  value={lastName}
                  onChangeText={setLastName}
                  placeholder="Peterson"
                  placeholderTextColor={Colors.placeholderColor}
                />
              </View>

              <View style={styles.inputWrapper}>
                <ThemedText type='default' style={styles.inputLabel}>{t('profile.birthday')}</ThemedText>
                <TouchableOpacity
                  style={styles.birthdayButton}
                  onPress={() => setShowDatePicker(true)}
                >
                  <View style={styles.birthdayContent}>
                    <View style={styles.calendarIconContainer}>
                      <Ionicons name="calendar" size={20} color={Colors.primaryForegroundColor} />
                    </View>
                    <ThemedText type='default' style={[
                      styles.birthdayText,
                      birthday && styles.birthdayTextSelected
                    ]}>
                      {formatDate(birthday)}
                    </ThemedText>
                  </View>
                </TouchableOpacity>
              </View>
            </View>

            <MainButton
              title={t('profile.continue')}
              onPress={handleConfirm}
            />
          </View>
        </ScrollView>

        {showDatePicker && (
          <Modal
            transparent={true}
            animationType="slide"
            visible={showDatePicker}
            onRequestClose={() => setShowDatePicker(false)}
          >
            <TouchableWithoutFeedback onPress={() => setShowDatePicker(false)}>
              <View style={styles.modalOverlay} />
            </TouchableWithoutFeedback>

            <View style={styles.datePickerContainer}>

              <DateTimePicker
                value={tempDate}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={handleBirthdayChange}
                maximumDate={new Date()}
                themeVariant="light"
                textColor={Colors.primaryForegroundColor}
              />
            </View>
          </Modal>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.parentBackgroundColor,
  },
  scrollViewContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
    paddingTop: 10,
  },
  languageSelectorContainer: {
    alignSelf: 'flex-end',
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.titleColor,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: Colors.secondaryForegroundColor,
    textAlign: 'center',
  },
  profilePictureContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  profilePictureButton: {
    shadowColor: Colors.primaryBackgroundColor,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  profilePicture: {
    position: 'relative',
    marginBottom: 12,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.secondaryBackgroundColor,
    borderWidth: 3,
    borderColor: Colors.secondaryBackgroundColor,
  },
  profileImagePlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.secondaryBackgroundColor,
    borderWidth: 3,
    borderColor: Colors.secondaryBackgroundColor,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraIcon: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: Colors.primaryBackgroundColor,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: Colors.parentBackgroundColor,
  },
  profilePictureHint: {
    fontSize: 14,
    color: Colors.secondaryForegroundColor,
    marginTop: 8,
  },
  inputContainer: {
    flex: 1,
    marginBottom: 32,
  },
  inputWrapper: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 16,
    color: Colors.primaryForegroundColor,
    marginBottom: 8,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  textInput: {
    backgroundColor: Colors.inputBackgroundColor,
    borderWidth: 1,
    borderColor: Colors.borderColor,
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 16,
    fontSize: 16,
    color: Colors.inputTextColor,
    fontWeight: '500',
  },
  birthdayButton: {
    backgroundColor: Colors.inputBackgroundColor,
    borderWidth: 1,
    borderColor: Colors.borderColor,
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  birthdayContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  calendarIconContainer: {
    width: 24,
    height: 24,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  birthdayText: {
    fontSize: 16,
    color: Colors.placeholderColor,
    fontWeight: '500',
  },
  birthdayTextSelected: {
    color: Colors.inputTextColor,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  datePickerContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.parentBackgroundColor,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 16,
    paddingBottom: Platform.OS === 'ios' ? 34 : 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 10,
  },
  datePickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderColor,
  },
  datePickerCancel: {
    padding: 8,
  },
  datePickerCancelText: {
    color: Colors.secondaryForegroundColor,
    fontSize: 16,
    fontWeight: '500',
  },
  datePickerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.titleColor,
  },
  datePickerConfirm: {
    padding: 8,
  },
  datePickerConfirmText: {
    color: Colors.primaryBackgroundColor,
    fontSize: 16,
    fontWeight: '600',
  },
});