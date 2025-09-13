import { useState } from 'react';
import { useSupabaseAuth } from './useSupabaseAuth';

export function useSupabasePhoneAuth() {
    const [phoneNumber, setPhoneNumber] = useState('');
    const [otp, setOtp] = useState('');
    const [isOtpSent, setIsOtpSent] = useState(false);
    const [countryCode, setCountryCode] = useState('US');
    const [callingCode, setCallingCode] = useState('1');
    const [focusedInput, setFocusedInput] = useState<'phone' | 'otp' | null>(null);
    
    const { signInWithPhone, verifyOtp, loading } = useSupabaseAuth();

    const handleSendOtp = async (onSuccess?: (message: string) => void, onError?: (message: string) => void) => {
        if (!phoneNumber || phoneNumber.length < 9) {
            onError?.('Please enter a valid phone number');
            return;
        }

        try {
            const fullPhoneNumber = `+${callingCode}${phoneNumber}`;
            const { error } = await signInWithPhone(fullPhoneNumber);
            
            if (error) {
                onError?.(error.message || 'Failed to send OTP. Please try again.');
                return;
            }
            
            setIsOtpSent(true);
            onSuccess?.(`OTP sent to ${fullPhoneNumber}`);
        } catch (error: any) {
            console.error('Error sending OTP:', error);
            onError?.(error.message || 'Failed to send OTP. Please try again.');
        }
    };

    const handleVerifyOtp = async (onSuccess?: (message: string) => void, onError?: (message: string) => void) => {
        if (!otp || otp.length !== 6) {
            onError?.('Please enter the 6-digit verification code');
            return;
        }

        try {
            const fullPhoneNumber = `+${callingCode}${phoneNumber}`;
            const { error } = await verifyOtp(fullPhoneNumber, otp);
            
            if (error) {
                onError?.(error.message || 'Invalid OTP. Please try again.');
                return;
            }

            console.log('OTP verification successful - Supabase will handle auth state');
            onSuccess?.('Verification successful!');
        } catch (error: any) {
            console.error('Error verifying OTP:', error);
            onError?.(error.message || 'Invalid OTP. Please try again.');
        }
    };

    const handleResendOtp = (onSuccess?: (message: string) => void, onError?: (message: string) => void) => {
        setOtp('');
        setIsOtpSent(false);
        handleSendOtp(onSuccess, onError);
    };

    const resetForm = () => {
        setOtp('');
        setIsOtpSent(false);
        setPhoneNumber('');
    };

    const resetToPhoneInput = () => {
        setOtp('');
        setIsOtpSent(false);
    };

    return {
        phoneNumber,
        setPhoneNumber,
        otp,
        setOtp,
        isLoading: loading,
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
        resetForm,
        resetToPhoneInput,
    };
}
