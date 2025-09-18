import CustomBackButton from '@/components/CustomBackButton';
import MainButton from '@/components/MainButton';
import { ThemedText } from '@/components/ThemedText';
import { Colors } from '@/constants/Colors';
import { useOnboardingStore } from '@/store/onboardingStore';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import {
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type GenderOption = 'Woman' | 'Man';

export default function GenderScreen() {
    const { setGender, gender } = useOnboardingStore();

    const handleBack = () => {
        router.back();
    };

    const handleContinue = () => {
        setGender(gender as GenderOption);
        router.push('/(onboarding)/interest');
    };

    const handleGenderSelect = (gender: GenderOption) => {
        setGender(gender);
    };

    const renderGenderOption = (gender: GenderOption, isSelected: boolean) => {

        return (
            <TouchableOpacity
                key={gender}
                style={[
                    styles.genderOption,
                    isSelected && styles.genderOptionSelected,
                ]}
                onPress={() => handleGenderSelect(gender)}
                activeOpacity={0.7}
            >
                <Text style={[
                    styles.genderText,
                    isSelected && styles.genderTextSelected,
                ]}>
                    {gender}
                </Text>
                {isSelected && (
                    <Ionicons
                        name="checkmark"
                        size={20}
                        color="#ffffff"
                    />
                )}
            </TouchableOpacity>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                <CustomBackButton />

                <ThemedText type='title'>I am a</ThemedText>

                <View style={styles.optionsContainer}>
                    {renderGenderOption('Woman', gender === 'Woman')}
                    {renderGenderOption('Man', gender === 'Man')}
                </View>

                <MainButton
                    title="Continue"
                    onPress={handleContinue}
                    disabled={gender === ''}
                />
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#ffffff',
    },
    content: {
        flex: 1,
        paddingHorizontal: 24,
        paddingTop: 20,
    },
    
    progressContainer: {
        marginBottom: 32,
    },
    progressText: {
        fontSize: 16,
        color: '#4A90E2',
        fontWeight: '500',
    },
    title: {
        fontSize: 32,
        fontWeight: '700',
        color: '#1a1a1a',
        marginBottom: 48,
        letterSpacing: -0.5,
    },
    optionsContainer: {
        flex: 1,
        gap: 16,
        marginVertical: 32,
    },
    genderOption: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: Colors.secondaryBackgroundColor,
        borderWidth: 1.5,
        borderColor: Colors.primaryBackgroundColor,
        borderRadius: 16,
        paddingHorizontal: 20,
        paddingVertical: 18,
        minHeight: 60,
    },
    genderOptionSelected: {
        backgroundColor: Colors.primaryBackgroundColor,
        borderColor: Colors.primaryBackgroundColor,
    },
    genderText: {
        fontSize: 17,
        fontWeight: '500',
        color: '#1a1a1a',
    },
    genderTextSelected: {
        color: '#ffffff',
    },
});
