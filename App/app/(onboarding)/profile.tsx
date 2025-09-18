import MainButton from '@/components/MainButton';
import { ThemedText } from '@/components/ThemedText';
import { useOnboardingStore } from '@/store/onboardingStore';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  Image,
  KeyboardAvoidingView,
  ScrollView,
  StyleSheet,
  Text,
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
  const { fullName, setFullName, birthday, setBirthday, profilePicture, setProfilePicture } = useOnboardingStore();
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [tempDate, setTempDate] = useState(birthday ? new Date(birthday) : new Date());
  const [firstName, setFirstName] = useState(fullName.split(' ')[0] || '');
  const [lastName, setLastName] = useState(fullName.split(' ').slice(1).join(' ') || '');

  const handleConfirm = () => {
    if (!firstName.trim() || !lastName.trim()) {
      Alert.alert('Missing Information', 'Please enter both first and last name');
      return;
    }

    if (!birthday) {
      Alert.alert('Missing Information', 'Please select your birthday');
      return;
    }

    setFullName(`${firstName.trim()} ${lastName.trim()}`);
    router.push('/(onboarding)/gender');
  };

  const handleBirthdayChange = (event: any, selectedDate: any) => {

    if (selectedDate) {
      setTempDate(selectedDate);
      setBirthday(selectedDate.toISOString());
    }
  };

  const formatDate = (dateString: any) => {
    if (!dateString) return 'Choose birthday date';

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
        Alert.alert('Permission required', 'Sorry, we need camera roll permissions to select a profile picture.');
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
      Alert.alert('Error', 'Failed to select image. Please try again.');
    }
  };

  const takePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();

      if (status !== 'granted') {
        Alert.alert('Permission required', 'Sorry, we need camera permissions to take a photo.');
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
      Alert.alert('Error', 'Failed to take photo. Please try again.');
    }
  };

  const showImagePickerOptions = () => {
    Alert.alert(
      'Select Profile Picture',
      'Choose an option',
      [
        {
          text: 'Choose from Library',
          onPress: pickImage,
        },
        {
          text: 'Take Photo',
          onPress: takePhoto,
        },
        {
          text: 'Cancel',
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
              <ThemedText type="title" style={styles.title}>Profile details</ThemedText>
              <Text style={styles.subtitle}>Let's get to know you better</Text>
            </View>

            <View style={styles.profilePictureContainer}>
              <TouchableOpacity onPress={showImagePickerOptions} style={styles.profilePictureButton}>
                <View style={styles.profilePicture}>
                  <Image
                    source={profilePicture ?
                      { uri: profilePicture } :
                      { uri: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face' }
                    }
                    style={styles.profileImage}
                  />
                  <View style={styles.cameraIcon}>
                    <Ionicons name="camera" size={20} color={Colors.textColor} />
                  </View>
                </View>
              </TouchableOpacity>
              <Text style={styles.profilePictureHint}>Tap to change photo</Text>
            </View>

            <View style={styles.inputContainer}>
              <View style={styles.inputWrapper}>
                <Text style={styles.inputLabel}>First name</Text>
                <TextInput
                  style={styles.textInput}
                  value={firstName}
                  onChangeText={setFirstName}
                  placeholder="David"
                  placeholderTextColor={Colors.placeholderColor}
                />
              </View>

              <View style={styles.inputWrapper}>
                <Text style={styles.inputLabel}>Last name</Text>
                <TextInput
                  style={styles.textInput}
                  value={lastName}
                  onChangeText={setLastName}
                  placeholder="Peterson"
                  placeholderTextColor={Colors.placeholderColor}
                />
              </View>

              <View style={styles.inputWrapper}>
                <Text style={styles.inputLabel}>Birthday</Text>
                <TouchableOpacity
                  style={styles.birthdayButton}
                  onPress={() => setShowDatePicker(true)}
                >
                  <View style={styles.birthdayContent}>
                    <View style={styles.calendarIconContainer}>
                      <Ionicons name="calendar" size={20} color={Colors.primaryForegroundColor} />
                    </View>
                    <Text style={[
                      styles.birthdayText,
                      birthday && styles.birthdayTextSelected
                    ]}>
                      {formatDate(birthday)}
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>
            </View>

            <MainButton
              title="Continue"
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