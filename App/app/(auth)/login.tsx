import MainButton from '@/components/MainButton';
import { Colors } from '@/constants/Colors';
import { auth } from '@/firebaseConfig';
import { FirebaseRecaptchaVerifierModal } from 'expo-firebase-recaptcha';
import {
    PhoneAuthProvider,
    signInWithCredential,
    signInWithPhoneNumber
} from 'firebase/auth';
import React, { useRef, useState } from 'react';
import {
    Dimensions,
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import CountryPicker from "react-native-country-picker-modal";
import { Button, Dialog, PaperProvider, Portal } from 'react-native-paper';

const { width, height } = Dimensions.get('window');

export default function LoginScreen() {
    const [phoneNumber, setPhoneNumber] = useState('');
    const [otp, setOtp] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [focusedInput, setFocusedInput] = useState<'phone' | 'otp' | null>(null);
    const [countryCode, setCountryCode] = useState("US");
    const [callingCode, setCallingCode] = useState("1");
    const [isOtpSent, setIsOtpSent] = useState(false);
    const [verificationId, setVerificationId] = useState('');
    
    const [dialogVisible, setDialogVisible] = useState(false);
    const [dialogTitle, setDialogTitle] = useState('');
    const [dialogMessage, setDialogMessage] = useState('');
    const [dialogType, setDialogType] = useState<'success' | 'error'>('success');

    const recaptchaVerifier = useRef(null);

    const showDialog = (title: string, message: string, type: 'success' | 'error' = 'success') => {
        setDialogTitle(title);
        setDialogMessage(message);
        setDialogType(type);
        setDialogVisible(true);
    };

    const hideDialog = () => {
        setDialogVisible(false);
    };

    const handleSendOtp = async () => {
        if (!phoneNumber || phoneNumber.length < 10) {
            showDialog('Invalid Phone Number', 'Please enter a valid phone number', 'error');
            return;
        }

        setIsLoading(true);

        try {
            const fullPhoneNumber = `+${callingCode}${phoneNumber}`;
            const confirmationResult = await signInWithPhoneNumber(
                auth,
                fullPhoneNumber,
                recaptchaVerifier.current as any
            );
            setVerificationId(confirmationResult.verificationId);
            setIsOtpSent(true);
            showDialog('Success', `OTP sent to ${fullPhoneNumber}`, 'success');
        } catch (error: any) {
            console.error('Error sending OTP:', error);
            showDialog('Error', error.message || 'Failed to send OTP. Please try again.', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerifyOtp = async () => {
        if (!otp || otp.length !== 6) {
            showDialog('Invalid OTP', 'Please enter the 6-digit verification code', 'error');
            return;
        }

        if (!verificationId) {
            showDialog('Error', 'No verification ID found. Please request OTP again.', 'error');
            return;
        }

        setIsLoading(true);

        try {
            const credential = PhoneAuthProvider.credential(verificationId, otp);
            await signInWithCredential(auth, credential);
            showDialog('Success', 'Phone number verified successfully!', 'success');
        } catch (error: any) {
            console.error('Error verifying OTP:', error);
            showDialog('Error', error.message || 'Invalid OTP. Please try again.', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const handleResendOtp = () => {
        setOtp('');
        setIsOtpSent(false);
        setVerificationId('');
        handleSendOtp();
    };

    const isValidPhone = phoneNumber.length >= 10;
    const isValidOtp = otp.length === 6;

    return (
        <PaperProvider>
            <SafeAreaView style={styles.container}>
                <StatusBar barStyle="dark-content" backgroundColor={Colors.primary.white} />

                <FirebaseRecaptchaVerifierModal
                    ref={recaptchaVerifier}
                    firebaseConfig={auth.app.options}
                    attemptInvisibleVerification
                />

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardView}
            >
                <ScrollView style={styles.content} keyboardShouldPersistTaps='handled'>
                    <View style={styles.mainContent}>
                        <Text style={styles.title}>
                            {isOtpSent ? 'Verify Code' : 'My Mobile'}
                        </Text>
                        <Text style={styles.description}>
                            {isOtpSent
                                ? `Please enter the 6-digit code sent to +${callingCode} ${phoneNumber}`
                                : 'Please enter your valid phone number. We will send you a 6-digit code to verify your account.'
                            }
                        </Text>
                        {!isOtpSent ? (
                            <View style={styles.inputSection}>
                                <View style={[
                                    styles.phoneInputContainer,
                                    focusedInput === 'phone' && styles.inputFocused
                                ]}>
                                    <View style={styles.countryCodeContainer}>
                                        <CountryPicker
                                            countryCode={countryCode as any}
                                            withFilter
                                            withFlag
                                            withCallingCode
                                            withEmoji
                                            onSelect={(country) => {
                                                setCountryCode(country.cca2);
                                                setCallingCode(country.callingCode[0]);
                                            }}
                                        />
                                        <Text style={styles.callingCode}>+{callingCode}</Text>
                                    </View>
                                    <TextInput
                                        style={styles.phoneInput}
                                        placeholder="Phone Number"
                                        placeholderTextColor={Colors.text.tertiary}
                                        value={phoneNumber}
                                        onChangeText={setPhoneNumber}
                                        keyboardType="phone-pad"
                                        maxLength={15}
                                        onFocus={() => setFocusedInput('phone')}
                                        onBlur={() => setFocusedInput(null)}
                                        autoFocus
                                    />
                                </View>
                            </View>
                        ) : (
                            <View style={styles.inputSection}>
                                <View style={[
                                    styles.otpInputContainer,
                                    focusedInput === 'otp' && styles.inputFocused
                                ]}>
                                    <TextInput
                                        style={styles.otpInput}
                                        placeholder="000000"
                                        placeholderTextColor={Colors.text.light}
                                        value={otp}
                                        onChangeText={setOtp}
                                        keyboardType="number-pad"
                                        maxLength={6}
                                        onFocus={() => setFocusedInput('otp')}
                                        onBlur={() => setFocusedInput(null)}
                                        autoFocus
                                        textAlign="center"
                                    />
                                </View>
                            </View>
                        )}

                        <MainButton
                            disabled={isLoading}
                            title={isOtpSent ? 'Verify Code' : 'Continue'}
                            onPress={isOtpSent ? handleVerifyOtp : handleSendOtp} />

                        {isOtpSent && (
                            <View style={styles.secondaryActions}>
                                <TouchableOpacity
                                    onPress={handleResendOtp}
                                    disabled={isLoading}
                                    activeOpacity={0.7}
                                >
                                    <Text style={styles.linkText}>
                                        Resend Code
                                    </Text>
                                </TouchableOpacity>
                                <Text style={styles.separatorText}>•</Text>
                                <TouchableOpacity
                                    onPress={() => {
                                        setIsOtpSent(false);
                                        setOtp('');
                                        setVerificationId('');
                                    }}
                                    activeOpacity={0.7}
                                >
                                    <Text style={styles.linkText}>
                                        Change Number
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>

            <Portal>
                <Dialog visible={dialogVisible} onDismiss={hideDialog}>
                    <Dialog.Title style={[
                        styles.dialogTitle,
                        { color: dialogType === 'error' ? Colors.primary.red : '#4CAF50' }
                    ]}>
                        {dialogTitle}
                    </Dialog.Title>
                    <Dialog.Content>
                        <Text style={styles.dialogMessage}>{dialogMessage}</Text>
                    </Dialog.Content>
                    <Dialog.Actions>
                        <Button 
                            onPress={hideDialog}
                            textColor={dialogType === 'error' ? Colors.primary.red : '#4CAF50'}
                            labelStyle={styles.dialogButton}
                        >
                            OK
                        </Button>
                    </Dialog.Actions>
                </Dialog>
            </Portal>
        </SafeAreaView>
        </PaperProvider>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.primary.white,
    },
    keyboardView: {
        flex: 1,
    },
    content: {
        flex: 1,
        paddingHorizontal: Math.max(24, width * 0.06),
        paddingTop: Math.max(20, height * 0.03),
    },
    mainContent: {
        flex: 1,
        maxWidth: 400,
        alignSelf: 'center',
        width: '100%',
        justifyContent: 'center',
    },
    title: {
        fontSize: Math.min(32, width * 0.08),
        fontWeight: 'bold',
        color: Colors.text.primary,
        marginBottom: Math.max(16, height * 0.02),
        textAlign: 'center',
    },
    description: {
        fontSize: Math.min(16, width * 0.04),
        color: Colors.text.secondary,
        lineHeight: Math.min(24, width * 0.06),
        marginBottom: Math.max(40, height * 0.05),
        textAlign: 'center',
        paddingHorizontal: 16,
    },
    inputSection: {
        marginBottom: Math.max(40, height * 0.05),
        alignItems: 'center',
    },
    phoneInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.primary.white,
        borderWidth: 1,
        borderColor: Colors.text.light,
        borderRadius: 12,
        paddingHorizontal: 16,
        height: Math.max(56, height * 0.07),
        maxHeight: 64,
        width: '100%',
    },
    inputFocused: {
        borderColor: Colors.primary.red,
        borderWidth: 2,
    },
    countryCodeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingRight: 16,
        borderRightWidth: 1,
        borderRightColor: Colors.text.light,
        marginRight: 16,
    },
    callingCode: {
        fontSize: 16,
        color: Colors.text.primary,
        fontWeight: '500',
        marginLeft: 8,
    },
    phoneInput: {
        flex: 1,
        fontSize: 16,
        color: Colors.text.primary,
        padding: 0,
        fontWeight: '500',
    },
    otpInputContainer: {
        backgroundColor: Colors.primary.white,
        borderWidth: 1,
        borderColor: Colors.text.light,
        borderRadius: 12,
        width: '100%',
        height: Math.max(56, height * 0.07),
        maxHeight: 64,
        justifyContent: 'center',
        alignItems: 'center',
    },
    otpInput: {
        fontSize: 18,
        fontWeight: '500',
        color: Colors.text.primary,
        backgroundColor: 'transparent',
        width: '100%',
        height: '100%',
        textAlign: 'center',
        letterSpacing: 8,
        padding: 0,
    },
    continueButton: {
        backgroundColor: Colors.primary.red,
        borderRadius: 28,
        height: Math.max(56, height * 0.07),
        maxHeight: 64,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: Math.max(20, height * 0.03),
        shadowColor: Colors.primary.red,
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    continueButtonDisabled: {
        backgroundColor: Colors.text.light,
        shadowOpacity: 0,
        elevation: 0,
    },
    continueButtonText: {
        fontSize: 18,
        fontWeight: '600',
        color: Colors.primary.white,
    },
    secondaryActions: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 24,
        gap: 12,
    },
    linkText: {
        fontSize: 16,
        color: Colors.primary.red,
        fontWeight: '500',
        textAlign: 'center',
    },
    separatorText: {
        fontSize: 16,
        color: Colors.text.tertiary,
        fontWeight: '400',
    },
    dialogTitle: {
        fontSize: 20,
        fontWeight: '600',
        textAlign: 'center',
    },
    dialogMessage: {
        fontSize: 16,
        color: Colors.text.secondary,
        textAlign: 'center',
        lineHeight: 22,
    },
    dialogButton: {
        fontSize: 16,
        fontWeight: '600',
    },
});