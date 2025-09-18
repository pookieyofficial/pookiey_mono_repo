import CustomBackButton from '@/components/CustomBackButton';
import MainButton from '@/components/MainButton';
import { ThemedText } from '@/components/ThemedText';
import { Colors } from '@/constants/Colors';
import { useOnboardingStore } from '@/store/onboardingStore';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const interests = [
    { id: 'photography', name: 'Photography', icon: 'camera' },
    { id: 'shopping', name: 'Shopping', icon: 'bag' },
    { id: 'karaoke', name: 'Karaoke', icon: 'mic' },
    { id: 'yoga', name: 'Yoga', icon: 'body' },
    { id: 'cooking', name: 'Cooking', icon: 'restaurant' },
    { id: 'tennis', name: 'Tennis', icon: 'tennisball' },
    { id: 'run', name: 'Run', icon: 'walk' },
    { id: 'swimming', name: 'Swimming', icon: 'water' },
    { id: 'art', name: 'Art', icon: 'brush' },
    { id: 'traveling', name: 'Traveling', icon: 'airplane' },
    { id: 'extreme', name: 'Extreme', icon: 'trail-sign' },
    { id: 'music', name: 'Music', icon: 'musical-notes' },
    { id: 'drink', name: 'Drink', icon: 'wine' },
    { id: 'videogames', name: 'Video games', icon: 'game-controller' },
];

export default function InterestScreen() {
    const { interests: storedInterests, setInterests } = useOnboardingStore();

    const handleBack = () => {
        router.back();
    };

    const handleContinue = () => {
        router.push('/(onboarding)/contact');
    };

    const toggleInterest = (interestName: string) => {
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
        const isSelected = (storedInterests || []).includes(interest.name);

        return (
            <TouchableOpacity
                key={interest.id}
                style={[
                    styles.interestChip,
                    isSelected && styles.interestChipSelected,
                ]}
                onPress={() => toggleInterest(interest.name)}
                activeOpacity={0.7}
            >
                <Ionicons
                    name={interest.icon as any}
                    size={18}
                    color={isSelected ? '#ffffff' : '#666666'}
                />
                <Text style={[
                    styles.interestText,
                    isSelected && styles.interestTextSelected,
                ]}>
                    {interest.name}
                </Text>
            </TouchableOpacity>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <CustomBackButton />
            </View>
            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                <View style={styles.content}>
                        
                    

                    <View style={styles.titleSection}>
                        <ThemedText type="title" style={styles.titleOverride}>Interests</ThemedText>
                        <ThemedText style={styles.subtitle}>
                            Let everyone know what you're passionate about.
                        </ThemedText>
                    </View>

                    <View style={styles.interestsContainer}>
                        {interests.map(interest => renderInterestChip(interest))}
                    </View>
                </View>
            </ScrollView>

            <View style={styles.buttonContainer}>
                <MainButton
                    title="Continue"
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
        justifyContent:"center",
    },
    scrollView: {
        flex: 1,
    },
    content: {
        paddingHorizontal: 24,
        paddingTop: 20,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 32,
        marginLeft:10,
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
        justifyContent: 'space-between',
        gap: 12,
        marginBottom: 32,
    },
    interestChip: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#ffffff',
        borderWidth: 1,
        borderColor: 'rgba(0, 0, 0, 0.05)',
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingVertical: 16,
        gap: 12,
        height: 56,
        width: '48%',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    interestChipSelected: {
        backgroundColor: Colors.primaryBackgroundColor,
        borderColor: Colors.primaryBackgroundColor,
        shadowColor: Colors.primaryBackgroundColor,
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
    interestText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1a1a1a',
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
