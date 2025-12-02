import CustomBackButton from '@/components/CustomBackButton';
import MainButton from '@/components/MainButton';
import { ThemedText } from '@/components/ThemedText';
import { Colors } from '@/constants/Colors';
import { useOnboardingStore } from '@/store/onboardingStore';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View,
    ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const commonOccupations = [
    { id: 'student', name: 'Student', icon: 'book' },
    { id: 'developer', name: 'Developer', icon: 'code' },
    { id: 'designer', name: 'Designer', icon: 'brush' },
    { id: 'teacher', name: 'Teacher', icon: 'school' },
    { id: 'doctor', name: 'Doctor', icon: 'medical' },
    { id: 'nurse', name: 'Nurse', icon: 'heart' },
    { id: 'engineer', name: 'Engineer', icon: 'build' },
    { id: 'lawyer', name: 'Lawyer', icon: 'scale' },
    { id: 'finance', name: 'Finance', icon: 'calculator' },
    { id: 'marketing', name: 'Marketing', icon: 'megaphone' },
    { id: 'sales', name: 'Sales', icon: 'trending-up' },
    { id: 'consultant', name: 'Consultant', icon: 'briefcase' },
    { id: 'founder', name: 'Founder', icon: 'rocket' },
    { id: 'artist', name: 'Artist', icon: 'color-palette' },
    { id: 'writer', name: 'Writer', icon: 'create' },
    { id: 'chef', name: 'Chef', icon: 'restaurant' },
];

export default function OccupationScreen() {
    const { t } = useTranslation();
    const { occupation, setOccupation } = useOnboardingStore();
    const [customOccupation, setCustomOccupation] = useState('');
    const [showCustomInput, setShowCustomInput] = useState(false);

    const handleContinue = () => {
        const selectedOccupation = showCustomInput && customOccupation.trim() 
            ? customOccupation.trim() 
            : occupation;
        
        if (!selectedOccupation) {
            return;
        }
        
        setOccupation(selectedOccupation);
        router.push('/(onboarding)/interest');
    };

    const handleOccupationSelect = (occName: string) => {
        setOccupation(occName);
        setShowCustomInput(false);
        setCustomOccupation('');
    };

    const handleCustomInputFocus = () => {
        setShowCustomInput(true);
        setOccupation('');
    };

    const handleCustomInputChange = (text: string) => {
        setCustomOccupation(text);
        if (text.trim()) {
            setOccupation(text.trim());
        }
    };

    const renderOccupationChip = (occ: typeof commonOccupations[0]) => {
        const isSelected = occupation === occ.name && !showCustomInput;

        return (
            <TouchableOpacity
                key={occ.id}
                style={[
                    styles.occupationChip,
                    isSelected && styles.occupationChipSelected,
                ]}
                onPress={() => handleOccupationSelect(occ.name)}
                activeOpacity={0.7}
            >
                <Ionicons
                    name={occ.icon as any}
                    size={16}
                    color={isSelected ? '#ffffff' : '#666666'}
                />
                <ThemedText style={[
                    styles.occupationText,
                    isSelected && styles.occupationTextSelected,
                ]} numberOfLines={1}>
                    {occ.name}
                </ThemedText>
            </TouchableOpacity>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <CustomBackButton />
            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                <View style={styles.content}>
                    <View style={styles.titleSection}>
                        <ThemedText type="title" style={styles.titleOverride}>{t('occupation.title')}</ThemedText>
                        <ThemedText style={styles.subtitle}>
                            {t('occupation.subtitle')}
                        </ThemedText>
                    </View>

                    {/* Custom Input Field at Top */}
                    <View style={styles.customInputContainer}>
                        {!showCustomInput ? (
                            <TouchableOpacity
                                style={styles.customInputChip}
                                onPress={handleCustomInputFocus}
                                activeOpacity={0.7}
                            >
                                <Ionicons
                                    name="create-outline"
                                    size={18}
                                    color={Colors.primaryBackgroundColor}
                                />
                                <ThemedText type='defaultSemiBold' style={styles.customInputButtonText}>
                                    {t('occupation.noneOfAbove')}
                                </ThemedText>
                            </TouchableOpacity>
                        ) : (
                            <View style={styles.inputWrapper}>
                                <Ionicons
                                    name="create-outline"
                                    size={18}
                                    color={Colors.primaryBackgroundColor}
                                />
                                <TextInput
                                    style={styles.customInput}
                                    value={customOccupation}
                                    onChangeText={handleCustomInputChange}
                                    placeholder={t('occupation.enterCustom')}
                                    placeholderTextColor="#888888"
                                    autoFocus
                                />
                                <TouchableOpacity
                                    style={styles.cancelCustomButton}
                                    onPress={() => {
                                        setShowCustomInput(false);
                                        setCustomOccupation('');
                                        setOccupation('');
                                    }}
                                >
                                    <Ionicons
                                        name="close-circle"
                                        size={20}
                                        color="#999999"
                                    />
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>

                    {/* Occupation Options */}
                    <View style={styles.occupationsContainer}>
                        {commonOccupations.map(occ => renderOccupationChip(occ))}
                    </View>
                </View>
            </ScrollView>

            <View style={styles.buttonContainer}>
                <MainButton
                    title={t('occupation.continue')}
                    onPress={handleContinue}
                    disabled={!occupation}
                />
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#ffffff',
        justifyContent: "center",
    },
    scrollView: {
        flex: 1,
    },
    content: {
        paddingHorizontal: 24,
    },
    titleSection: {
        marginBottom: 32,
        paddingHorizontal: 8,
    },
    titleOverride: {
        marginBottom: 8,
        letterSpacing: -0.5,
    },
    subtitle: {
        fontSize: 15,
        color: Colors.secondaryForegroundColor,
        lineHeight: 22,
        fontWeight: '400',
    },
    customInputContainer: {
        marginBottom: 20,
        paddingHorizontal: 8,
    },
    customInputChip: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#ffffff',
        borderWidth: 1.5,
        borderColor: Colors.primaryBackgroundColor,
        borderStyle: 'dashed',
        borderRadius: 25,
        paddingHorizontal: 16,
        paddingVertical: 12,
        gap: 8,
        shadowColor: Colors.primaryBackgroundColor,
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 1,
    },
    customInputButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: Colors.primaryBackgroundColor,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#ffffff',
        borderWidth: 1.5,
        borderColor: Colors.primaryBackgroundColor,
        borderRadius: 25,
        paddingHorizontal: 14,
        paddingVertical: 10,
        gap: 8,
        shadowColor: Colors.primaryBackgroundColor,
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 1,
    },
    customInput: {
        flex: 1,
        fontSize: 14,
        fontWeight: '600',
        color: '#1a1a1a',
        paddingVertical: 0,
    },
    cancelCustomButton: {
        padding: 4,
    },
    occupationsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
        marginBottom: 32,
        paddingHorizontal: 8,
    },
    occupationChip: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#ffffff',
        borderWidth: 1,
        borderColor: 'rgba(0, 0, 0, 0.08)',
        borderRadius: 25,
        paddingHorizontal: 14,
        paddingVertical: 10,
        gap: 6,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.04,
        shadowRadius: 3,
        elevation: 1,
    },
    occupationChipSelected: {
        backgroundColor: Colors.primaryBackgroundColor,
        borderColor: Colors.primaryBackgroundColor,
        shadowColor: Colors.primaryBackgroundColor,
        shadowOffset: {
            width: 0,
            height: 3,
        },
        shadowOpacity: 0.25,
        shadowRadius: 6,
        elevation: 4,
    },
    occupationText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#444',
    },
    occupationTextSelected: {
        color: '#ffffff',
    },
    buttonContainer: {
        paddingHorizontal: 24,
        backgroundColor: '#ffffff',
        borderTopWidth: 1,
        borderTopColor: '#f5f5f5',
    },
});

