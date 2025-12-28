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
import CustomBackButton from '@/components/CustomBackButton';
import { useTranslation } from 'react-i18next';

export default function PrivacyPolicyScreen() {
  const { t } = useTranslation();
  const email = 'pookiey.official@gmail.com';

  const handleEmailPress = async () => {
    const emailUrl = `mailto:${email}`;
    
    try {
      const canOpen = await Linking.canOpenURL(emailUrl);
      if (canOpen) {
        await Linking.openURL(emailUrl);
      }
    } catch (error) {
      // console.error('Error opening email:', error);
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
            {t('privacyPolicy.title')}
          </ThemedText>
        </View>

        <View style={styles.content}>
          <ThemedText style={styles.intro}>
            {t('privacyPolicy.intro')}
          </ThemedText>

          {/* Section 1 */}
          <View style={styles.section}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>
              {t('privacyPolicy.section1Title')}
            </ThemedText>
            <ThemedText style={styles.sectionText}>
              {t('privacyPolicy.section1Content')}
            </ThemedText>
            <View style={styles.bulletList}>
              <ThemedText style={styles.bulletPoint}>
                • {t('privacyPolicy.section1Point1')}
              </ThemedText>
              <ThemedText style={styles.bulletPoint}>
                • {t('privacyPolicy.section1Point2')}
              </ThemedText>
              <ThemedText style={styles.bulletPoint}>
                • {t('privacyPolicy.section1Point3')}
              </ThemedText>
              <ThemedText style={styles.bulletPoint}>
                • {t('privacyPolicy.section1Point4')}
              </ThemedText>
            </View>
          </View>

          {/* Section 2 */}
          <View style={styles.section}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>
              {t('privacyPolicy.section2Title')}
            </ThemedText>
            <ThemedText style={styles.sectionText}>
              {t('privacyPolicy.section2Content')}
            </ThemedText>
          </View>

          {/* Section 3 */}
          <View style={styles.section}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>
              {t('privacyPolicy.section3Title')}
            </ThemedText>
            <ThemedText style={styles.sectionText}>
              {t('privacyPolicy.section3Content')}
            </ThemedText>
            <View style={styles.bulletList}>
              <ThemedText style={styles.bulletPoint}>
                • {t('privacyPolicy.section3Point1')}
              </ThemedText>
              <ThemedText style={styles.bulletPoint}>
                • {t('privacyPolicy.section3Point2')}
              </ThemedText>
              <ThemedText style={styles.bulletPoint}>
                • {t('privacyPolicy.section3Point3')}
              </ThemedText>
            </View>
          </View>

          {/* Section 4 */}
          <View style={styles.section}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>
              {t('privacyPolicy.section4Title')}
            </ThemedText>
            <ThemedText style={styles.sectionText}>
              {t('privacyPolicy.section4Content')}
            </ThemedText>
          </View>

          {/* Section 5 */}
          <View style={styles.section}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>
              {t('privacyPolicy.section5Title')}
            </ThemedText>
            <ThemedText style={styles.sectionText}>
              {t('privacyPolicy.section5Content')}
            </ThemedText>
          </View>

          {/* Section 6 */}
          <View style={styles.section}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>
              {t('privacyPolicy.section6Title')}
            </ThemedText>
            <ThemedText style={styles.sectionText}>
              {t('privacyPolicy.section6Content')}
            </ThemedText>
          </View>

          {/* Section 7 */}
          <View style={styles.section}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>
              {t('privacyPolicy.section7Title')}
            </ThemedText>
            <ThemedText style={styles.sectionText}>
              {t('privacyPolicy.section7Content')}
            </ThemedText>
          </View>

          {/* Section 8 */}
          <View style={styles.section}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>
              {t('privacyPolicy.section8Title')}
            </ThemedText>
            <ThemedText style={styles.sectionText}>
              {t('privacyPolicy.section8Content')}
            </ThemedText>
          </View>

          {/* Contact Section */}
          <View style={styles.section}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>
              {t('privacyPolicy.contactTitle')}
            </ThemedText>
            <ThemedText style={styles.sectionText}>
              {t('privacyPolicy.contactContent')}
            </ThemedText>
            <TouchableOpacity onPress={handleEmailPress} activeOpacity={0.7}>
              <ThemedText type="defaultSemiBold" style={styles.contactInfo}>
                {t('privacyPolicy.email')}: {email}
              </ThemedText>
            </TouchableOpacity>
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
  lastUpdated: {
    fontSize: 12,
    color: Colors.text.tertiary,
    fontStyle: 'italic',
  },
  content: {
    paddingHorizontal: 20,
  },
  intro: {
    fontSize: 16,
    color: Colors.text.secondary,
    lineHeight: 24,
    marginBottom: 24,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    color: Colors.titleColor,
    fontSize: 18,
    marginBottom: 12,
    fontWeight: '600',
  },
  sectionText: {
    fontSize: 15,
    color: Colors.text.secondary,
    lineHeight: 22,
    marginBottom: 12,
  },
  bulletList: {
    marginTop: 8,
    marginLeft: 8,
  },
  bulletPoint: {
    fontSize: 15,
    color: Colors.text.secondary,
    lineHeight: 22,
    marginBottom: 8,
  },
  contactInfo: {
    fontSize: 15,
    color: Colors.primary.red,
    marginTop: 8,
  },
  footer: {
    marginTop: 24,
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  footerText: {
    fontSize: 14,
    color: Colors.text.tertiary,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});

