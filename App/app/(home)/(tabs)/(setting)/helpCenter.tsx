import React from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '@/constants/Colors';
import { ThemedText } from '@/components/ThemedText';
import { Ionicons } from '@expo/vector-icons';
import CustomBackButton from '@/components/CustomBackButton';
import { useTranslation } from 'react-i18next';

export default function HelpCenterScreen() {
  const { t } = useTranslation();
  const supportEmail = 'support@pookiey.com';
  const contactUrl = 'https://pookiey.com/support';

  const handleEmailPress = async () => {
    const emailUrl = `mailto:${supportEmail}`;
    
    try {
      const canOpen = await Linking.canOpenURL(emailUrl);
      if (canOpen) {
        await Linking.openURL(emailUrl);
      }
    } catch (error) {
      // console.error('Error opening email:', error);
    }
  };

  const handleContactUsPress = async () => {
    try {
      const canOpen = await Linking.canOpenURL(contactUrl);
      if (canOpen) {
        await Linking.openURL(contactUrl);
      }
    } catch (error) {
      // console.error('Error opening URL:', error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <CustomBackButton />
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.header}>
          <ThemedText type="title" style={styles.title}>
            {t('helpCenter.title')}
          </ThemedText>
          <ThemedText style={styles.subtitle}>
            {t('helpCenter.subtitle')}
          </ThemedText>
        </View>

        {/* Contact Information Section */}
        <View style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            {t('helpCenter.contactUs')}
          </ThemedText>

          {/* Email Contact */}
          <TouchableOpacity
            style={styles.contactCard}
            onPress={handleEmailPress}
            activeOpacity={0.7}
          >
            <View style={styles.contactIconContainer}>
              <Ionicons name="mail" size={24} color={Colors.primary.red} />
            </View>
            <View style={styles.contactInfo}>
              <ThemedText style={styles.contactLabel}>
                {t('helpCenter.email')}
              </ThemedText>
              <ThemedText type="defaultSemiBold" style={styles.contactValue}>
                {supportEmail}
              </ThemedText>
            </View>
            <Ionicons name="chevron-forward" size={20} color={Colors.text.tertiary} />
          </TouchableOpacity>

        </View>

        {/* Send Message Section */}
        <View style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            {t('helpCenter.sendMessage')}
          </ThemedText>

          <TouchableOpacity
            style={styles.contactCard}
            onPress={handleContactUsPress}
            activeOpacity={0.7}
          >
            <View style={styles.contactIconContainer}>
              <Ionicons name="globe" size={24} color={Colors.primary.red} />
            </View>
            <View style={styles.contactInfo}>
              <ThemedText style={styles.contactLabel}>
                {t('helpCenter.contactUs')}
              </ThemedText>
              <ThemedText type="defaultSemiBold" style={styles.contactValue}>
                {contactUrl}
              </ThemedText>
            </View>
            <Ionicons name="chevron-forward" size={20} color={Colors.text.tertiary} />
          </TouchableOpacity>
        </View>

        {/* FAQ Section */}
        <View style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            {t('helpCenter.frequentlyAsked')}
          </ThemedText>

          <View style={styles.faqCard}>
            <ThemedText type="defaultSemiBold" style={styles.faqQuestion}>
              {t('helpCenter.faq1Question')}
            </ThemedText>
            <ThemedText style={styles.faqAnswer}>
              {t('helpCenter.faq1Answer')}
            </ThemedText>
          </View>

          <View style={styles.faqCard}>
            <ThemedText type="defaultSemiBold" style={styles.faqQuestion}>
              {t('helpCenter.faq2Question')}
            </ThemedText>
            <ThemedText style={styles.faqAnswer}>
              {t('helpCenter.faq2Answer')}
            </ThemedText>
          </View>

          <View style={styles.faqCard}>
            <ThemedText type="defaultSemiBold" style={styles.faqQuestion}>
              {t('helpCenter.faq3Question')}
            </ThemedText>
            <ThemedText style={styles.faqAnswer}>
              {t('helpCenter.faq3Answer')}
            </ThemedText>
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.parentBackgroundColor,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 30,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 10,
    marginBottom: 24,
  },
  title: {
    color: Colors.titleColor,
    marginBottom: 8,
  },
  subtitle: {
    color: Colors.text.secondary,
    lineHeight: 22,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    color: Colors.titleColor,
    marginBottom: 16,
    fontSize: 18,
  },
  contactCard: {
    backgroundColor: Colors.primary.white,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  contactIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(233, 64, 87, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  contactInfo: {
    flex: 1,
    marginLeft: 12,
  },
  contactLabel: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginBottom: 4,
  },
  contactValue: {
    color: Colors.titleColor,
  },
  faqCard: {
    backgroundColor: Colors.primary.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  faqQuestion: {
    color: Colors.titleColor,
    marginBottom: 8,
  },
  faqAnswer: {
    fontSize: 14,
    color: Colors.text.secondary,
    lineHeight: 20,
  },
});

