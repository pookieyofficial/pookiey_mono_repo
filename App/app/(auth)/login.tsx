import MainButton from '@/components/MainButton';
import CustomDialog, { DialogType } from '@/components/CustomDialog';
import { Colors } from '@/constants/Colors';
import { useSupabasePhoneAuth } from '@/hooks/useSupabasePhoneAuth';
import { useGoogleAuth } from '@/hooks/useGoogleAuth';
import React, { useState } from 'react';
import {
    Dimensions,
    Image,
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
    Linking
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

    const { signInWithGoogleMobile, loading: googleLoading } = useGoogleAuth();

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
                        contentContainerStyle={styles.scrollContent}
                    >
                        <View style={styles.mainContent}>
                            {!isOtpSent ? (
                                <>
                                    {/* Top Section */}
                                    <View style={styles.topSection}>
                                        {/* Logo */}
                                        <View style={styles.logoContainer}>
                                            <Image
                                                source={require('@/assets/images/icon.png')}
                                                style={styles.logo}
                                                resizeMode="contain"
                                            />
                                        </View>

                                        {/* Title */}
                                        <Text style={styles.title}>Sign up to continue</Text>

                                        {/* Email Button */}
                                        <TouchableOpacity
                                            style={styles.emailButton}
                                            onPress={() => {
                                                // TODO: Implement email signup
                                                showDialog('Coming Soon', 'Email signup will be available soon', 'info');
                                            }}
                                            activeOpacity={0.8}
                                        >
                                            <Text style={styles.emailButtonText}>Continue with email</Text>
                                        </TouchableOpacity>

                                        {/* Phone Button */}
                                        {/* <TouchableOpacity
                                            style={styles.phoneButton}
                                            onPress={() => {
                                                // This will show the phone input
                                                setFocusedInput('phone');
                                            }}
                                            activeOpacity={0.8}
                                        >
                                            <Text style={styles.phoneButtonText}>Use phone number</Text>
                                        </TouchableOpacity> */}
                                    </View>

                                    {/* Bottom Section */}
                                    <View style={styles.bottomSection}>
                                        {/* Social Buttons */}
                                        <View style={styles.socialButtonsContainer}>
                                            {/* Divider */}
                                            <View style={styles.divider}>
                                                <View style={styles.dividerLine} />
                                                <Text style={styles.dividerText}>or sign up with</Text>
                                                <View style={styles.dividerLine} />
                                            </View>

                                            {/* Social Buttons Row */}
                                            <View style={styles.socialButtonsRow}>
                                                {/* Facebook */}
                                                <TouchableOpacity
                                                    style={styles.socialButton}
                                                    onPress={() => {
                                                        showDialog('Coming Soon', 'Facebook signup will be available soon', 'info');
                                                    }}
                                                    activeOpacity={0.7}
                                                >
                                                    <Ionicons name="logo-facebook" size={24} color={Colors.primary.red} />
                                                </TouchableOpacity>

                                                {/* Google */}
                                                <TouchableOpacity
                                                    style={styles.socialButton}
                                                    onPress={handleGoogleSignIn}
                                                    disabled={googleLoading}
                                                    activeOpacity={0.7}
                                                >
                                                    <Ionicons name="logo-google" size={24} color={Colors.primary.red} />
                                                </TouchableOpacity>

                                                {/* Apple */}
                                                <TouchableOpacity
                                                    style={styles.socialButton}
                                                    onPress={() => {
                                                        showDialog('Coming Soon', 'Apple signup will be available soon', 'info');
                                                    }}
                                                    activeOpacity={0.7}
                                                >
                                                    <Ionicons name="logo-apple" size={24} color={Colors.primary.red} />
                                                </TouchableOpacity>
                                            </View>
                                        </View>

                                        {/* Terms and Privacy */}
                                        <View style={styles.termsContainer}>
                                            <TouchableOpacity
                                                onPress={() => Linking.openURL('https://example.com/terms')}
                                                activeOpacity={0.7}
                                            >
                                                <Text style={styles.termsText}>Terms of use</Text>
                                            </TouchableOpacity>
                                            <Text style={styles.separator}> </Text>
                                            <TouchableOpacity
                                                onPress={() => Linking.openURL('https://example.com/privacy')}
                                                activeOpacity={0.7}
                                            >
                                                <Text style={styles.termsText}>Privacy Policy</Text>
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                </>
                            ) : (
                                <>
                                    {/* OTP Screen */}
                                    <Text style={styles.title}>Verify Code</Text>
                                    <Text style={styles.description}>
                                        Please enter the 6-digit code sent to +{callingCode} {phoneNumber}
                                    </Text>
                                    
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

                                    <MainButton
                                        disabled={isLoading}
                                        title="Verify Code"
                                        onPress={handleVerifyOtpWithDialog} />

                                    <View style={styles.secondaryActions}>
                                        <TouchableOpacity
                                            onPress={handleResendOtpWithDialog}
                                            disabled={isLoading}
                                            activeOpacity={0.7}
                                        >
                                            <Text style={styles.linkText}>Resend Code</Text>
                                        </TouchableOpacity>
                                        <Text style={styles.separatorText}>•</Text>
                                        <TouchableOpacity
                                            onPress={handleChangeNumber}
                                            activeOpacity={0.7}
                                        >
                                            <Text style={styles.linkText}>Change Number</Text>
                                        </TouchableOpacity>
                                    </View>
                                </>
                            )}

                            {/* Phone Input Modal */}
                            {focusedInput === 'phone' && !isOtpSent && (
                                <View style={styles.phoneInputOverlay}>
                                    <View style={styles.phoneInputModal}>
                                        <Text style={styles.modalTitle}>Enter Phone Number</Text>
                                        <View style={[
                                            styles.phoneInputContainer,
                                            styles.modalPhoneInput
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
                                                autoFocus
                                            />
                                        </View>
                                        <View style={styles.modalButtons}>
                                            <TouchableOpacity
                                                style={styles.cancelButton}
                                                onPress={() => setFocusedInput(null)}
                                            >
                                                <Text style={styles.cancelButtonText}>Cancel</Text>
                                            </TouchableOpacity>
                                            <TouchableOpacity
                                                style={styles.sendButton}
                                                onPress={() => {
                                                    handleSendOtpWithDialog();
                                                    setFocusedInput(null);
                                                }}
                                                disabled={isLoading || !phoneNumber.trim()}
                                            >
                                                <Text style={styles.sendButtonText}>Send Code</Text>
                                            </TouchableOpacity>
                                        </View>
                                    </View>
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
    },
    scrollContent: {
        flexGrow: 1,
        justifyContent: 'space-between',
        paddingHorizontal: Math.max(24, width * 0.06),
        paddingTop: Math.max(60, height * 0.08),
        paddingBottom: Math.max(40, height * 0.05),
    },
    mainContent: {
        flex: 1,
        maxWidth: 400,
        alignSelf: 'center',
        width: '100%',
        justifyContent: 'space-between',
    },
    topSection: {
        flex: 1,
        justifyContent: 'flex-start',
        paddingTop: 20,
    },
    bottomSection: {
        justifyContent: 'flex-end',
    },
    logoContainer: {
        alignItems: 'center',
        marginBottom: 40,
    },
    logo: {
        width: 80,
        height: 80,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: Colors.primary.black,
        textAlign: 'center',
        marginBottom: 40,
    },
    description: {
        fontSize: 16,
        color: Colors.text.secondary,
        lineHeight: 24,
        marginBottom: 30,
        textAlign: 'center',
        paddingHorizontal: 16,
    },
    emailButton: {
        backgroundColor: Colors.primary.red,
        borderRadius: 12,
        height: 56,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
        marginTop: 20,
        shadowColor: Colors.onboarding.shadowColor,
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: Colors.opacity.shadow,
        shadowRadius: 4,
        elevation: 2,
    },
    emailButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: Colors.primary.white,
    },
    phoneButton: {
        backgroundColor: Colors.primary.white,
        borderWidth: 1,
        borderColor: Colors.text.light,
        borderRadius: 12,
        height: 56,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 30,
    },
    phoneButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: Colors.primary.red,
    },
    divider: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 30,
        width: '100%',
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
    socialButtonsContainer: {
        marginBottom: 40,
        alignItems: 'center',
    },
    socialButtonsRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 20,
    },
    socialButton: {
        width: 56,
        height: 56,
        backgroundColor: Colors.primary.white,
        borderWidth: 1,
        borderColor: Colors.text.light,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: Colors.onboarding.shadowColor,
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: Colors.opacity.shadow,
        shadowRadius: 4,
        elevation: 2,
    },
    termsContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    termsText: {
        fontSize: 14,
        color: Colors.primary.red,
        fontWeight: '500',
    },
    separator: {
        fontSize: 14,
        color: Colors.primary.red,
        marginHorizontal: 8,
    },
    // Modal styles
    phoneInputOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
    },
    phoneInputModal: {
        backgroundColor: Colors.primary.white,
        borderRadius: 16,
        padding: 24,
        margin: 20,
        width: '90%',
        maxWidth: 400,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: Colors.text.primary,
        textAlign: 'center',
        marginBottom: 20,
    },
    modalPhoneInput: {
        marginBottom: 20,
    },
    modalButtons: {
        flexDirection: 'row',
        gap: 12,
    },
    cancelButton: {
        flex: 1,
        backgroundColor: Colors.text.light,
        borderRadius: 8,
        height: 48,
        justifyContent: 'center',
        alignItems: 'center',
    },
    cancelButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: Colors.text.primary,
    },
    sendButton: {
        flex: 1,
        backgroundColor: Colors.primary.red,
        borderRadius: 8,
        height: 48,
        justifyContent: 'center',
        alignItems: 'center',
    },
    sendButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: Colors.primary.white,
    },
    // Existing styles for OTP and phone input
    inputSection: {
        marginBottom: 30,
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
        height: 56,
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
        height: 56,
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
