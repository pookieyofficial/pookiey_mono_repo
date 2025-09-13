import MainButton from '@/components/MainButton';
import CustomDialog, { DialogType } from '@/components/CustomDialog';
import { Colors } from '@/constants/Colors';
import { useSupabasePhoneAuth } from '@/hooks/useSupabasePhoneAuth';
import { useGoogleAuth } from '@/hooks/useGoogleAuth';
import React, { useState } from 'react';
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
import { PaperProvider } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

export default function SupabaseLoginScreen() {
    const {
        phoneNumber,
        setPhoneNumber,
        otp,
        setOtp,
        isLoading,
        isOtpSent,
        countryCode,
        setCountryCode,
        callingCode,
        setCallingCode,
        focusedInput,
        setFocusedInput,
        handleSendOtp,
        handleVerifyOtp,
        handleResendOtp,
        resetToPhoneInput,
    } = useSupabasePhoneAuth();

    const { signInWithGoogle, signInWithGoogleMobile, loading: googleLoading } = useGoogleAuth();

    const [dialogVisible, setDialogVisible] = useState(false);
    const [dialogTitle, setDialogTitle] = useState('');
    const [dialogMessage, setDialogMessage] = useState('');
    const [dialogType, setDialogType] = useState<DialogType>('success');

    const showDialog = (title: string, message: string, type: DialogType = 'success') => {
        setDialogTitle(title);
        setDialogMessage(message);
        setDialogType(type);
        setDialogVisible(true);
    };

    const hideDialog = () => {
        setDialogVisible(false);
    };

    const handleSendOtpWithDialog = () => {
        handleSendOtp(
            (message) => showDialog('Success!', message, 'success'),
            (message) => showDialog('Invalid Phone Number', message, 'error')
        );
    };

    const handleVerifyOtpWithDialog = () => {
        handleVerifyOtp(
            (message) => showDialog('Verified!', message, 'success'),
            (message) => showDialog('Verification Failed', message, 'error')
        );
    };

    const handleResendOtpWithDialog = () => {
        handleResendOtp(
            (message) => showDialog('Code Resent!', message, 'success'),
            (message) => showDialog('Resend Failed', message, 'error')
        );
    };

    const handleChangeNumber = () => {
        resetToPhoneInput();
    };

    const handleGoogleSignIn = async () => {
        try {
            const { error } = await signInWithGoogleMobile();
            if (error) {
                showDialog('Google Sign In Failed', error.message, 'error');
            }
        } catch (error: any) {
            showDialog('Google Sign In Failed', error.message || 'An unexpected error occurred', 'error');
        }
    };

    return (
        <PaperProvider>
            <SafeAreaView style={styles.container}>
                <StatusBar barStyle="dark-content" backgroundColor={Colors.primary.white} />

                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={styles.keyboardView}
                >
                    <ScrollView style={styles.content}
                        keyboardShouldPersistTaps='handled'
                    >
                        <View style={styles.mainContent}>
                            <Text style={styles.title}>
                                {isOtpSent ? 'Verify Code' : 'Welcome Back'}
                            </Text>
                            <Text style={styles.description}>
                                {isOtpSent
                                    ? `Please enter the 6-digit code sent to +${callingCode} ${phoneNumber}`
                                    : 'Sign in with your phone number or Google account to continue.'
                                }
                            </Text>

                            {!isOtpSent ? (
                                <>
                                    {/* Google Sign In Button */}
                                    <TouchableOpacity
                                        style={styles.googleButton}
                                        onPress={handleGoogleSignIn}
                                        disabled={googleLoading || isLoading}
                                        activeOpacity={0.7}
                                    >
                                        <Ionicons name="logo-google" size={20} color="#4285F4" />
                                        <Text style={styles.googleButtonText}>
                                            {googleLoading ? 'Signing in...' : 'Continue with Google'}
                                        </Text>
                                    </TouchableOpacity>

                                    <View style={styles.divider}>
                                        <View style={styles.dividerLine} />
                                        <Text style={styles.dividerText}>OR</Text>
                                        <View style={styles.dividerLine} />
                                    </View>

                                    {/* Phone Input */}
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
                                </>
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
                                disabled={isLoading || googleLoading}
                                title={isOtpSent ? 'Verify Code' : 'Continue with Phone'}
                                onPress={isOtpSent ? handleVerifyOtpWithDialog : handleSendOtpWithDialog} />

                            {isOtpSent && (
                                <View style={styles.secondaryActions}>
                                    <TouchableOpacity
                                        onPress={handleResendOtpWithDialog}
                                        disabled={isLoading}
                                        activeOpacity={0.7}
                                    >
                                        <Text style={styles.linkText}>
                                            Resend Code
                                        </Text>
                                    </TouchableOpacity>
                                    <Text style={styles.separatorText}>•</Text>
                                    <TouchableOpacity
                                        onPress={handleChangeNumber}
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

                <CustomDialog
                    visible={dialogVisible}
                    type={dialogType}
                    title={dialogTitle}
                    message={dialogMessage}
                    onDismiss={hideDialog}
                    primaryButton={{ text: 'OK', onPress: hideDialog }}
                    autoHide={dialogType === 'success' ? 3000 : undefined}
                />
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
    googleButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: Colors.primary.white,
        borderWidth: 1,
        borderColor: Colors.text.light,
        borderRadius: 12,
        height: Math.max(56, height * 0.07),
        maxHeight: 64,
        marginBottom: Math.max(20, height * 0.03),
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    googleButtonText: {
        fontSize: 16,
        fontWeight: '500',
        color: Colors.text.primary,
        marginLeft: 12,
    },
    divider: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: Math.max(20, height * 0.03),
    },
    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: Colors.text.light,
    },
    dividerText: {
        fontSize: 14,
        color: Colors.text.tertiary,
        fontWeight: '500',
        marginHorizontal: 16,
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
});
