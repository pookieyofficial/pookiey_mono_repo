import React, { useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '@/constants/Colors';
import { ThemedText } from '@/components/ThemedText';
import { Ionicons } from '@expo/vector-icons';
import CustomBackButton from '@/components/CustomBackButton';
import MainButton from '@/components/MainButton';
import { useAuth } from '@/hooks/useAuth';
import { deleteAccountAPI } from '@/APIs/userAPIs';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import CustomDialog, { DialogType } from '@/components/CustomDialog';

export default function DeleteAccountScreen() {
  const { token, signOut } = useAuth();
  const [isDeleting, setIsDeleting] = useState(false);
  const { t } = useTranslation();
  const [confirmDialogVisible, setConfirmDialogVisible] = useState(false);
  const [errorDialogVisible, setErrorDialogVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successDialogVisible, setSuccessDialogVisible] = useState(false);

  const handleDeleteAccount = () => {
    setConfirmDialogVisible(true);
  };

  const performDelete = async () => {
    try {
      setIsDeleting(true);
      setConfirmDialogVisible(false);
      if (!token) {
        setErrorMessage(t('deleteAccount.errorNotLoggedIn'));
        setErrorDialogVisible(true);
        return;
      }

      await axios.delete(deleteAccountAPI, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      setSuccessDialogVisible(true);
    } catch (error: any) {
      console.error('Delete account error:', error);
      setErrorMessage(error?.response?.data?.message || t('deleteAccount.errorGeneric'));
      setErrorDialogVisible(true);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <CustomDialog
        visible={confirmDialogVisible}
        type="warning"
        title={t('deleteAccount.confirmTitle')}
        message={t('deleteAccount.confirmMessage')}
        onDismiss={() => setConfirmDialogVisible(false)}
        primaryButton={{
          text: t('deleteAccount.confirmDelete'),
          onPress: performDelete,
        }}
        cancelButton={{
          text: t('deleteAccount.confirmCancel'),
          onPress: () => setConfirmDialogVisible(false),
        }}
      />
      <CustomDialog
        visible={errorDialogVisible}
        type="error"
        title={t('deleteAccount.errorTitle')}
        message={errorMessage}
        onDismiss={() => setErrorDialogVisible(false)}
        primaryButton={{
          text: 'OK',
          onPress: () => setErrorDialogVisible(false),
        }}
      />
      <CustomDialog
        visible={successDialogVisible}
        type="success"
        title={t('deleteAccount.successTitle')}
        message={t('deleteAccount.successMessage')}
        onDismiss={async () => {
          setSuccessDialogVisible(false);
          await signOut();
        }}
        primaryButton={{
          text: 'OK',
          onPress: async () => {
            setSuccessDialogVisible(false);
            await signOut();
          },
        }}
      />
      <CustomBackButton />
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.content}>
          {/* Icon */}
          <View style={styles.iconContainer}>
            <View style={styles.iconCircle}>
              <Ionicons name="heart-dislike" size={48} color={Colors.primary.red} />
            </View>
          </View>

          {/* Title */}
          <ThemedText type="title" style={styles.title}>
            {t('deleteAccount.title')}
          </ThemedText>

          {/* Subtitle */}
          <ThemedText style={styles.subtitle}>
            {t('deleteAccount.subtitle')}
          </ThemedText>

          {/* Warning Section */}
          <View style={styles.warningCard}>
            <View style={styles.warningHeader}>
              <Ionicons name="warning" size={24} color={Colors.primary.red} />
              <ThemedText type="defaultSemiBold" style={styles.warningTitle}>
                {t('deleteAccount.warningTitle')}
              </ThemedText>
            </View>
            <ThemedText style={styles.warningText}>
              {t('deleteAccount.warningIntro')}
            </ThemedText>
            <View style={styles.warningList}>
              <View style={styles.warningItem}>
                <Ionicons name="close-circle" size={20} color={Colors.primary.red} />
                <ThemedText style={styles.warningItemText}>
                  {t('deleteAccount.warningPoint1')}
                </ThemedText>
              </View>
              <View style={styles.warningItem}>
                <Ionicons name="close-circle" size={20} color={Colors.primary.red} />
                <ThemedText style={styles.warningItemText}>
                  {t('deleteAccount.warningPoint2')}
                </ThemedText>
              </View>
              <View style={styles.warningItem}>
                <Ionicons name="close-circle" size={20} color={Colors.primary.red} />
                <ThemedText style={styles.warningItemText}>
                  {t('deleteAccount.warningPoint3')}
                </ThemedText>
              </View>
              <View style={styles.warningItem}>
                <Ionicons name="close-circle" size={20} color={Colors.primary.red} />
                <ThemedText style={styles.warningItemText}>
                  {t('deleteAccount.warningPoint4')}
                </ThemedText>
              </View>
            </View>
          </View>

          {/* Alternative Options */}
          <View style={styles.alternativesCard}>
            <ThemedText type="defaultSemiBold" style={styles.alternativesTitle}>
              {t('deleteAccount.beforeYouGoTitle')}
            </ThemedText>
            <ThemedText style={styles.alternativesText}>
              {t('deleteAccount.beforeYouGoText')}
            </ThemedText>
          </View>

          {/* Delete Button */}
          <View style={styles.buttonContainer}>
            <MainButton
              title={
                isDeleting
                  ? t('deleteAccount.buttonLoading')
                  : t('deleteAccount.button')
              }
              onPress={handleDeleteAccount}
              disabled={isDeleting}
              type="primary"
            />
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
  content: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  iconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(233, 64, 87, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    color: Colors.titleColor,
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.text.secondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  warningCard: {
    backgroundColor: Colors.primary.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1.5,
    borderColor: 'rgba(233, 64, 87, 0.3)',
  },
  warningHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  warningTitle: {
    color: Colors.primary.red,
    flex: 1,
  },
  warningText: {
    fontSize: 15,
    color: Colors.text.secondary,
    lineHeight: 22,
    marginBottom: 16,
  },
  warningList: {
    gap: 12,
  },
  warningItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  warningItemText: {
    fontSize: 15,
    color: Colors.text.secondary,
    flex: 1,
  },
  alternativesCard: {
    backgroundColor: Colors.primary.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 32,
  },
  alternativesTitle: {
    color: Colors.titleColor,
    marginBottom: 12,
  },
  alternativesText: {
    fontSize: 15,
    color: Colors.text.secondary,
    lineHeight: 22,
  },
  buttonContainer: {
    marginTop: 8,
  },
});

