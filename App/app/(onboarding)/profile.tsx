import MainButton from '@/components/MainButton';
import { ThemedText } from '@/components/ThemedText';
import { useOnboardingStore } from '@/store/onboardingStore';
import { router } from 'expo-router';
import React from 'react';
import {
    Image,
    KeyboardAvoidingView,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';


export default function ProfileScreen() {
    const { fullName, setFullName, birthday, setBirthday } = useOnboardingStore();

    const handleConfirm = () => {
        router.push('/(onboarding)/gender');
    };

    const handleBirthdayPress = () => {
        console.log('Open date picker');
    };

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView behavior="padding" style={styles.container}>

                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollViewContent}>

                    <View style={styles.content}>
                        <View style={styles.header}>
                            <ThemedText type="title">Profile details</ThemedText>
                        </View>

                        <View style={styles.profilePictureContainer}>
                            <View style={styles.profilePicture}>
                                <Image
                                    source={{ uri: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face' }}
                                    style={styles.profileImage}
                                />
                                <TouchableOpacity style={styles.cameraIcon}>
                                    <View style={styles.cameraIconInner}>
                                        <Text style={styles.cameraText}>+</Text>
                                    </View>
                                </TouchableOpacity>
                            </View>
                        </View>

                        <View style={styles.inputContainer}>
                            <View style={styles.inputWrapper}>
                                <Text style={styles.inputLabel}>First name</Text>
                                <TextInput
                                    style={styles.textInput}
                                    value={fullName}
                                    onChangeText={setFullName}
                                    placeholder="David"
                                    placeholderTextColor="#999"
                                />
                            </View>

                            <View style={styles.inputWrapper}>
                                <Text style={styles.inputLabel}>Last name</Text>
                                <TextInput
                                    style={styles.textInput}
                                    value={birthday}
                                    onChangeText={setBirthday}
                                    placeholder="Peterson"
                                    placeholderTextColor="#999"
                                />
                            </View>

                            <View style={styles.inputWrapper}>
                                <TouchableOpacity style={styles.birthdayButton} onPress={handleBirthdayPress}>
                                    <View style={styles.birthdayContent}>
                                        <View style={styles.calendarIconContainer}>
                                            <Text style={styles.calendarIcon}>📅</Text>
                                        </View>
                                        <Text style={styles.birthdayText}>Choose birthday date</Text>
                                    </View>
                                </TouchableOpacity>
                            </View>
                        </View>

                        <MainButton title="Continue" onPress={handleConfirm} />
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView >
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#ffffff',
    },
    scrollViewContent: {
        flexGrow: 1,
    },
    content: {
        flex: 1,
        paddingHorizontal: 24,
        paddingTop: 20,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 48,
        paddingTop: 20,
    },
    title: {
        fontSize: 32,
        fontWeight: '700',
        color: '#1a1a1a',
        letterSpacing: -0.5,
    },
    skipContainer: {
        paddingVertical: 8,
        paddingHorizontal: 4,
    },
    skipButton: {
        fontSize: 16,
        color: '#E53E3E',
        fontWeight: '600',
    },
    profilePictureContainer: {
        alignItems: 'center',
        marginBottom: 56,
    },
    profilePicture: {
        position: 'relative',
    },
    profileImage: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#f7f7f7',
    },
    cameraIcon: {
        position: 'absolute',
        bottom: -4,
        right: -4,
    },
    cameraIconInner: {
        width: 32,
        height: 32,
        backgroundColor: '#E53E3E',
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
        borderColor: '#ffffff',
    },
    cameraText: {
        fontSize: 16,
        color: '#ffffff',
        fontWeight: '600',
        marginTop: -1,
    },
    inputContainer: {
        flex: 1,
        marginBottom: 32,
    },
    inputWrapper: {
        marginBottom: 28,
    },
    inputLabel: {
        fontSize: 14,
        color: '#666666',
        marginBottom: 12,
        fontWeight: '600',
        letterSpacing: 0.2,
    },
    textInput: {
        backgroundColor: '#ffffff',
        borderBottomWidth: 1.5,
        borderBottomColor: '#e8e8e8',
        paddingVertical: 16,
        paddingHorizontal: 0,
        fontSize: 17,
        color: '#1a1a1a',
        fontWeight: '500',
    },
    birthdayButton: {
        backgroundColor: '#ffffff',
        borderBottomWidth: 1.5,
        borderBottomColor: '#e8e8e8',
        paddingVertical: 16,
        paddingHorizontal: 0,
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
    calendarIcon: {
        fontSize: 18,
    },
    birthdayText: {
        fontSize: 17,
        color: '#E53E3E',
        fontWeight: '500',
    },
});
