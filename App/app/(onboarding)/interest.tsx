import CustomBackButton from '@/components/CustomBackButton';
import MainButton from '@/components/MainButton';
import { ThemedText } from '@/components/ThemedText';
import { Colors } from '@/constants/Colors';
import { useOnboardingStore } from '@/store/onboardingStore';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { useTranslation } from 'react-i18next';
import {
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const interests = [
    { id: 'photography', key: 'photography', icon: 'camera', label: 'Photos' },
    { id: 'shopping', key: 'shopping', icon: 'bag', label: 'Shopping' },
    { id: 'karaoke', key: 'karaoke', icon: 'mic', label: 'Singing' },
    { id: 'yoga', key: 'yoga', icon: 'body', label: 'Yoga' },
    { id: 'cooking', key: 'cooking', icon: 'restaurant', label: 'Cooking' },
    { id: 'tennis', key: 'tennis', icon: 'tennisball', label: 'Sports' },
    { id: 'run', key: 'run', icon: 'walk', label: 'Fitness' },
    { id: 'swimming', key: 'swimming', icon: 'water', label: 'Swimming' },
    { id: 'art', key: 'art', icon: 'brush', label: 'Art' },
    { id: 'traveling', key: 'traveling', icon: 'airplane', label: 'Travel' },
    { id: 'extreme', key: 'extreme', icon: 'trail-sign', label: 'Adventure' },
    { id: 'music', key: 'music', icon: 'musical-notes', label: 'Music' },
    { id: 'drink', key: 'drink', icon: 'wine', label: 'Drinks' },
    { id: 'videogames', key: 'videogames', icon: 'game-controller', label: 'Gaming' },
    { id: 'movies', key: 'movies', icon: 'film', label: 'Movies' },
    { id: 'reading', key: 'reading', icon: 'book', label: 'Reading' },
];

export default function InterestScreen() {
    const { t } = useTranslation();
    const { interests: storedInterests, setInterests } = useOnboardingStore();

    const handleBack = () => {
        router.back();
    };

    const handleContinue = () => {
        if (storedInterests.length < 2 || storedInterests.length > 5) {
            Alert.alert(t('interest.errorTitle'), t('interest.errorMessage'));
        } else {
            router.push('/(onboarding)/image');
        }
    };

    const toggleInterest = (interestKey: string) => {
        // Get the English name for storage
        const interestName = interests.find(i => i.key === interestKey)?.key || interestKey;
        const currentInterests = storedInterests || [];
        let updatedInterests;

        if (currentInterests.includes(interestName)) {
            updatedInterests = currentInterests.filter(name => name !== interestName);
        } else {
            updatedInterests = [...currentInterests, interestName];
        }

        setInterests(updatedInterests);
    };

    const renderInterestChip = (interest: typeof interests[0]) => {
        const isSelected = (storedInterests || []).includes(interest.key);

        return (
            <TouchableOpacity
                key={interest.id}
                style={[
                    styles.interestChip,
                    isSelected && styles.interestChipSelected,
                ]}
                onPress={() => toggleInterest(interest.key)}
                activeOpacity={0.7}
            >
                <Ionicons
                    name={interest.icon as any}
                    size={16}
                    color={isSelected ? '#ffffff' : '#666666'}
                />
                <ThemedText style={[
                    styles.interestText,
                    isSelected && styles.interestTextSelected,
                ]} numberOfLines={1}>
                    {interest.label}
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
                        <ThemedText type="title" style={styles.titleOverride}>{t('interest.title')}</ThemedText>
                        <ThemedText style={styles.subtitle}>
                            {t('interest.subtitle')}
                        </ThemedText>
                    </View>

                    <View style={styles.interestsContainer}>
                        {interests.map(interest => renderInterestChip(interest))}
                    </View>
                </View>
            </ScrollView>

            <View style={styles.buttonContainer}>
                <MainButton
                    title={t('interest.continue')}
                    onPress={handleContinue}
                    disabled={false}
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
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 32,
        marginLeft: 10,
    },
    backButton: {
        width: 44,
        height: 44,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#f0f0f0',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#ffffff',
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
    interestsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
        marginBottom: 32,
    },
    interestChip: {
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
    interestChipSelected: {
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
    interestText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#444',
    },
    interestTextSelected: {
        color: '#ffffff',
    },
    buttonContainer: {
        paddingHorizontal: 24,
        backgroundColor: '#ffffff',
        borderTopWidth: 1,
        borderTopColor: '#f5f5f5',
    },
});
