import CustomBackButton from '@/components/CustomBackButton';
import MainButton from '@/components/MainButton';
import { ThemedText } from '@/components/ThemedText';
import { Colors } from '@/constants/Colors';
import { useOnboardingStore } from '@/store/onboardingStore';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import i18n from '@/config/i18n';
import {
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View,
    Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

// Languages matching the i18n config - organized by region
const languages = [
    // Popular/European
    { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸', category: 'popular' },
    { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸', category: 'popular' },
    { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷', category: 'popular' },
    { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪', category: 'popular' },
    { code: 'pt', name: 'Portuguese', nativeName: 'Português', flag: '🇧🇷', category: 'popular' },
    { code: 'it', name: 'Italian', nativeName: 'Italiano', flag: '🇮🇹', category: 'popular' },
    { code: 'nl', name: 'Dutch', nativeName: 'Nederlands', flag: '🇳🇱', category: 'popular' },
    { code: 'ru', name: 'Russian', nativeName: 'Русский', flag: '🇷🇺', category: 'popular' },
    
    // Asian
    { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳', category: 'asian' },
    { code: 'zh', name: 'Chinese', nativeName: '中文', flag: '🇨🇳', category: 'asian' },
    { code: 'ja', name: 'Japanese', nativeName: '日本語', flag: '🇯🇵', category: 'asian' },
    { code: 'ko', name: 'Korean', nativeName: '한국어', flag: '🇰🇷', category: 'asian' },
    { code: 'th', name: 'Thai', nativeName: 'ไทย', flag: '🇹🇭', category: 'asian' },
    { code: 'vi', name: 'Vietnamese', nativeName: 'Tiếng Việt', flag: '🇻🇳', category: 'asian' },
    { code: 'id', name: 'Indonesian', nativeName: 'Bahasa Indonesia', flag: '🇮🇩', category: 'asian' },
    
    // South Asian
    { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', flag: '🇧🇩', category: 'south-asian' },
    { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', flag: '🇮🇳', category: 'south-asian' },
    { code: 'ne', name: 'Nepali', nativeName: 'नेपाली', flag: '🇳🇵', category: 'south-asian' },
    { code: 'ur', name: 'Urdu', nativeName: 'اردو', flag: '🇵🇰', category: 'south-asian' },
    
    // Middle Eastern
    { code: 'ar', name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦', category: 'middle-eastern' },
    { code: 'tr', name: 'Turkish', nativeName: 'Türkçe', flag: '🇹🇷', category: 'middle-eastern' },
];

export default function LanguageScreen() {
    const { t } = useTranslation();
    const { setLanguage } = useOnboardingStore();
    // Default to English if no language is set
    const [selectedLanguage, setSelectedLanguage] = useState(() => {
        const currentLang = i18n.language || 'en';
        // Ensure it's a valid language code, fallback to 'en'
        return languages.some(l => l.code === currentLang) ? currentLang : 'en';
    });
    const [scaleAnim] = useState(new Animated.Value(0));

    useEffect(() => {
        // Initialize with English if not set
        if (!i18n.language || !languages.some(l => l.code === i18n.language)) {
            i18n.changeLanguage('en');
            setLanguage('en');
        }
        
        // Animate language options
        Animated.spring(scaleAnim, {
            toValue: 1,
            tension: 50,
            friction: 7,
            useNativeDriver: true,
        }).start();
    }, []);

    const handleContinue = () => {
        router.push('/(onboarding)/microphone');
    };

    const handleLanguageSelect = (langCode: string) => {
        setSelectedLanguage(langCode);
        setLanguage(langCode);
        i18n.changeLanguage(langCode);
    };

    const renderLanguageOption = (lang: typeof languages[0], index: number) => {
        const isSelected = selectedLanguage === lang.code;

        return (
            <Animated.View
                key={lang.code}
                style={[
                    { opacity: scaleAnim, transform: [{ scale: scaleAnim }] },
                ]}
            >
                <TouchableOpacity
                    style={[
                        styles.languageOption,
                        isSelected && styles.languageOptionSelected,
                    ]}
                    onPress={() => handleLanguageSelect(lang.code)}
                    activeOpacity={0.7}
                >
                    <ThemedText style={styles.languageFlag}>{lang.flag}</ThemedText>
                    <ThemedText style={[
                        styles.languageText,
                        isSelected && styles.languageTextSelected,
                    ]} numberOfLines={1}>
                        {lang.name}
                    </ThemedText>
                </TouchableOpacity>
            </Animated.View>
        );
    };

    // Sort languages: English first, then alphabetically
    const sortedLanguages = [...languages].sort((a, b) => {
        if (a.code === 'en') return -1;
        if (b.code === 'en') return 1;
        return a.name.localeCompare(b.name);
    });

    return (
        <SafeAreaView style={styles.container}>
            <CustomBackButton />
            <ScrollView 
                style={styles.scrollView} 
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                <View style={styles.content}>
                    <View style={styles.illustrationContainer}>
                        <LinearGradient
                            colors={[Colors.primaryBackgroundColor + '20', Colors.primaryBackgroundColor + '05']}
                            style={styles.illustrationGradient}
                        >
                            <View style={styles.illustration}>
                                <Ionicons name="language" size={50} color={Colors.primaryBackgroundColor} />
                                <View style={styles.globeRing}>
                                    <Ionicons name="globe" size={30} color={Colors.primaryBackgroundColor + '40'} />
                                </View>
                            </View>
                        </LinearGradient>
                    </View>

                    <View style={styles.titleSection}>
                        <ThemedText type="title" style={styles.title}>
                            {t('language.title') || 'Choose Your Language'}
                        </ThemedText>
                        <ThemedText style={styles.subtitle}>
                            {t('language.subtitle') || 'Select your preferred language to continue'}
                        </ThemedText>
                    </View>

                    <View style={styles.languagesContainer}>
                        {sortedLanguages.map((lang, index) => renderLanguageOption(lang, index))}
                    </View>
                </View>
            </ScrollView>

            <View style={styles.buttonContainer}>
                <MainButton
                    title={t('common.continue') || 'Continue'}
                    onPress={handleContinue}
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
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: 20,
    },
    content: {
        paddingHorizontal: 24,
        paddingTop: 10,
    },
    illustrationContainer: {
        alignItems: 'center',
        marginVertical: 24,
        marginBottom: 32,
    },
    illustrationGradient: {
        width: 120,
        height: 120,
        borderRadius: 60,
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
    },
    illustration: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#ffffff',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
        shadowColor: Colors.primaryBackgroundColor,
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 5,
    },
    globeRing: {
        position: 'absolute',
        top: 10,
        right: 10,
    },
    titleSection: {
        alignItems: 'center',
        marginBottom: 28,
    },
    title: {
        marginBottom: 10,
        textAlign: 'center',
        letterSpacing: -0.5,
    },
    subtitle: {
        fontSize: 15,
        color: Colors.secondaryForegroundColor,
        textAlign: 'center',
        lineHeight: 22,
        paddingHorizontal: 20,
    },
    languagesContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
        marginBottom: 32,
    },
    languageOption: {
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
    languageOptionSelected: {
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
    languageFlag: {
        fontSize: 18,
    },
    languageText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#444',
    },
    languageTextSelected: {
        color: '#ffffff',
    },
    buttonContainer: {
        paddingHorizontal: 24,
        paddingTop: 16,
        paddingBottom: 8,
        backgroundColor: '#ffffff',
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
    },
});

