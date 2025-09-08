import { PhoneAuthProvider, signInWithCredential, signInWithPhoneNumber } from 'firebase/auth';
import { useRef, useState } from 'react';
import { Alert } from 'react-native';
import { auth } from '../firebaseConfig';

export function usePhoneAuth() {
    // Remove direct store access - let Firebase auth state handle it
    const [phoneNumber, setPhoneNumber] = useState('');
    const [otp, setOtp] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isOtpSent, setIsOtpSent] = useState(false);
    const [verificationId, setVerificationId] = useState('');
    const [countryCode, setCountryCode] = useState('US');
    const [callingCode, setCallingCode] = useState('1');
    const [focusedInput, setFocusedInput] = useState<'phone' | 'otp' | null>(null);
    const recaptchaVerifier = useRef(null);

    const handleSendOtp = async () => {
        if (!phoneNumber || phoneNumber.length < 10) {
            Alert.alert('Invalid Phone Number', 'Please enter a valid phone number');
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
            Alert.alert('Success', `OTP sent to ${fullPhoneNumber}`);
        } catch (error: any) {
            console.error('Error sending OTP:', error);
            Alert.alert('Error', error.message || 'Failed to send OTP. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerifyOtp = async (onSuccess?: () => void) => {
        if (!otp || otp.length !== 6) {
            Alert.alert('Invalid OTP', 'Please enter the 6-digit verification code');
            return;
        }
        if (!verificationId) {
            Alert.alert('Error', 'No verification ID found. Please request OTP again.');
            return;
        }
        setIsLoading(true);
        try {
            const credential = PhoneAuthProvider.credential(verificationId, otp);
            const userCredential = await signInWithCredential(auth, credential);
            
            console.log('OTP verification successful - Firebase will handle auth state');
            console.log('User phone:', userCredential.user.phoneNumber);
            
            Alert.alert('Success', 'Phone number verified successfully!');
            if (onSuccess) onSuccess();
        } catch (error: any) {
            console.error('Error verifying OTP:', error);
            Alert.alert('Error', error.message || 'Invalid OTP. Please try again.');
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

    return {
        phoneNumber,
        setPhoneNumber,
        otp,
        setOtp,
        isLoading,
        isOtpSent,
        setIsOtpSent,
        verificationId,
        setVerificationId,
        countryCode,
        setCountryCode,
        callingCode,
        setCallingCode,
        focusedInput,
        setFocusedInput,
        recaptchaVerifier,
        handleSendOtp,
        handleVerifyOtp,
        handleResendOtp,
    };
}
