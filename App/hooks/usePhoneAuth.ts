import { PhoneAuthProvider, signInWithCredential, signInWithPhoneNumber } from 'firebase/auth';
import { useRef, useState } from 'react';
import { auth } from '../firebaseConfig';

export function usePhoneAuth() {
    const [phoneNumber, setPhoneNumber] = useState('');
    const [otp, setOtp] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isOtpSent, setIsOtpSent] = useState(false);
    const [verificationId, setVerificationId] = useState('');
    const [countryCode, setCountryCode] = useState('US');
    const [callingCode, setCallingCode] = useState('1');
    const [focusedInput, setFocusedInput] = useState<'phone' | 'otp' | null>(null);
    const recaptchaVerifier = useRef(null);

    const handleSendOtp = async (onSuccess?: (message: string) => void, onError?: (message: string) => void) => {
        if (!phoneNumber || phoneNumber.length < 9) {
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
            onSuccess?.(`OTP sent to ${fullPhoneNumber}`);
        } catch (error: any) {
            console.error('Error sending OTP:', error);
            onError?.(error.message || 'Failed to send OTP. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerifyOtp = async (onSuccess?: (message: string) => void, onError?: (message: string) => void) => {
        if (!otp || otp.length !== 6) {
            onError?.('Please enter the 6-digit verification code');
            return;
        }
        if (!verificationId) {
            onError?.('No verification ID found. Please request OTP again.');
            return;
        }

        setIsLoading(true);
        try {
            const credential = PhoneAuthProvider.credential(verificationId, otp);
            const userCredential = await signInWithCredential(auth, credential);

            console.log('OTP verification successful - Firebase will handle auth state');
            console.log('User phone:', userCredential.user.phoneNumber);
        } catch (error: any) {
            console.error('Error verifying OTP:', error);
            onError?.(error.message || 'Invalid OTP. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleResendOtp = (onSuccess?: (message: string) => void, onError?: (message: string) => void) => {
        setOtp('');
        setIsOtpSent(false);
        setVerificationId('');
        handleSendOtp(onSuccess, onError);
    };

    const resetForm = () => {
        setOtp('');
        setIsOtpSent(false);
        setVerificationId('');
        setPhoneNumber('');
    };

    const resetToPhoneInput = () => {
        setOtp('');
        setIsOtpSent(false);
        setVerificationId('');
    };

    return {
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
        recaptchaVerifier,
        handleSendOtp,
        handleVerifyOtp,
        handleResendOtp,
        resetForm,
        resetToPhoneInput,
    };
}
