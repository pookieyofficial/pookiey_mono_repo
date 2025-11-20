import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { ThemedText } from './ThemedText';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { changeLanguage } from '@/config/i18n';
import { Colors } from '@/constants/Colors';

const languages = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'zh', name: 'Mandarin Chinese (Simplified)', nativeName: '中文 (简体)' },
  { code: 'es', name: 'Spanish', nativeName: 'Español' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية' },
  { code: 'fr', name: 'French', nativeName: 'Français' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা' },
  { code: 'ru', name: 'Russian', nativeName: 'Русский' },
  { code: 'pt', name: 'Portuguese (Brazilian)', nativeName: 'Português (Brasil)' },
  { code: 'id', name: 'Indonesian', nativeName: 'Bahasa Indonesia' },
  { code: 'de', name: 'German', nativeName: 'Deutsch' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語' },
  { code: 'ur', name: 'Urdu', nativeName: 'اردو' },
  { code: 'sw', name: 'Swahili', nativeName: 'Kiswahili' },
  { code: 'ko', name: 'Korean', nativeName: '한국어' },
  { code: 'tr', name: 'Turkish', nativeName: 'Türkçe' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिंदी' },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు' },
  { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી' },
  { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ' },
  { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം' },
  { code: 'pa', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ' },
  { code: 'or', name: 'Odia', nativeName: 'ଓଡ଼ିଆ' },
  { code: 'as', name: 'Assamese', nativeName: 'অসমীয়া' },
  { code: 'it', name: 'Italian', nativeName: 'Italiano' },
  { code: 'nl', name: 'Dutch', nativeName: 'Nederlands' },
  { code: 'vi', name: 'Vietnamese', nativeName: 'Tiếng Việt' },
  { code: 'th', name: 'Thai', nativeName: 'ไทย' },
  { code: 'fa', name: 'Persian (Farsi)', nativeName: 'فارسی' },
  { code: 'ne', name: 'Nepali', nativeName: 'नेपाली' },
];

interface LanguageSelectorProps {
  onLanguageChange?: (language: string) => void;
  store?: {
    setLanguage: (language: string) => void;
  };
}

export default function LanguageSelector({ onLanguageChange, store }: LanguageSelectorProps) {
  const { t, i18n } = useTranslation();
  const [modalVisible, setModalVisible] = useState(false);
  const currentLanguage = i18n.language || 'en';

  const handleLanguageSelect = async (languageCode: string) => {
    await changeLanguage(languageCode);
    setModalVisible(false);
    if (store) {
      store.setLanguage(languageCode);
    }
    if (onLanguageChange) {
      onLanguageChange(languageCode);
    }
  };

  // Filter languages to only show those that are registered in i18n
  const availableLanguages = languages.filter(lang => 
    i18n.hasResourceBundle(lang.code, 'translation')
  );

  const currentLang = availableLanguages.find(lang => lang.code === currentLanguage) || availableLanguages[0];

  return (
    <>
      <TouchableOpacity
        style={styles.selectorButton}
        onPress={() => setModalVisible(true)}
        activeOpacity={0.7}
      >
        <Ionicons name="language" size={20} color={Colors.primaryForegroundColor} />
        <ThemedText style={styles.selectorText}>{currentLang.nativeName}</ThemedText>
        <Ionicons name="chevron-down" size={16} color={Colors.secondaryForegroundColor} />
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <ThemedText type="title" style={styles.modalTitle}>
                {t('language.selectLanguage')}
              </ThemedText>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color={Colors.primaryForegroundColor} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.languageList} showsVerticalScrollIndicator={false}>
              {availableLanguages.map((language) => {
                const isSelected = language.code === currentLanguage;
                return (
                  <TouchableOpacity
                    key={language.code}
                    style={[
                      styles.languageItem,
                      isSelected && styles.languageItemSelected,
                    ]}
                    onPress={() => handleLanguageSelect(language.code)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.languageItemContent}>
                      <ThemedText
                        style={[
                          styles.languageName,
                          isSelected && styles.languageNameSelected,
                        ]}
                      >
                        {language.nativeName}
                      </ThemedText>
                      <ThemedText
                        style={[
                          styles.languageCode,
                          isSelected && styles.languageCodeSelected,
                        ]}
                      >
                        {language.name}
                      </ThemedText>
                    </View>
                    {isSelected && (
                      <Ionicons
                        name="checkmark-circle"
                        size={24}
                        color={Colors.primaryBackgroundColor}
                      />
                    )}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  selectorButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.secondaryBackgroundColor,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.primaryBackgroundColor,
    gap: 8,
  },
  selectorText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primaryForegroundColor,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.parentBackgroundColor,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '80%',
    paddingBottom: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E8E8E8',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.titleColor,
  },
  closeButton: {
    padding: 4,
  },
  languageList: {
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  languageItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    marginBottom: 8,
    backgroundColor: Colors.secondaryBackgroundColor,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E8E8E8',
  },
  languageItemSelected: {
    backgroundColor: Colors.primaryBackgroundColor,
    borderColor: Colors.primaryBackgroundColor,
  },
  languageItemContent: {
    flex: 1,
  },
  languageName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.primaryForegroundColor,
    marginBottom: 4,
  },
  languageNameSelected: {
    color: Colors.textColor,
  },
  languageCode: {
    fontSize: 14,
    color: Colors.secondaryForegroundColor,
  },
  languageCodeSelected: {
    color: Colors.textColor,
    opacity: 0.9,
  },
});

