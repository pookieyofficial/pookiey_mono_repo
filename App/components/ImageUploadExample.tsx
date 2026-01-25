import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { Colors } from '@/constants/Colors';
import { useImageCompression } from '@/hooks/useImageCompression';
import { UploadedImageResult } from '@/utils/imageCompression';
import CustomDialog, { DialogType } from '@/components/CustomDialog';


export default function ImageUploadExample() {
  const {
    isUploading,
    progress,
    error,
    pickAndUploadSingle,
    pickAndUploadMultiple,
    resetError,
  } = useImageCompression();

  const [uploadedImages, setUploadedImages] = useState<UploadedImageResult[]>([]);

  // Dialog states
  const [dialogVisible, setDialogVisible] = useState(false);
  const [dialogType, setDialogType] = useState<DialogType>('info');
  const [dialogTitle, setDialogTitle] = useState<string>('');
  const [dialogMessage, setDialogMessage] = useState<string>('');
  const [dialogPrimaryButton, setDialogPrimaryButton] = useState<{ text: string; onPress: () => void }>({ text: 'OK', onPress: () => setDialogVisible(false) });
  const [dialogSecondaryButton, setDialogSecondaryButton] = useState<{ text: string; onPress: () => void } | undefined>(undefined);

  // Show dialog helper function
  const showDialog = (
    type: DialogType,
    message: string,
    title?: string,
    primaryButton?: { text: string; onPress: () => void },
    secondaryButton?: { text: string; onPress: () => void }
  ) => {
    setDialogType(type);
    setDialogTitle(title || '');
    setDialogMessage(message);
    setDialogPrimaryButton(primaryButton || { text: 'OK', onPress: () => setDialogVisible(false) });
    setDialogSecondaryButton(secondaryButton);
    setDialogVisible(true);
  };

  /**
   * Handle single image upload
   */
  const handleSingleUpload = async () => {
    try {
      const result = await pickAndUploadSingle({
        allowsEditing: true,
        aspect: [4, 3],
      });

      if (result) {
        setUploadedImages([...uploadedImages, result]);
        showDialog('success', 'Image uploaded successfully!', 'Success');
      }
    } catch (err) {
      showDialog('error', 'Failed to upload image', 'Error');
    }
  };

  /**
   * Handle multiple image upload
   */
  const handleMultipleUpload = async () => {
    try {
      const results = await pickAndUploadMultiple();

      if (results.length > 0) {
        setUploadedImages([...uploadedImages, ...results]);
        showDialog('success', `${results.length} images uploaded successfully!`, 'Success');
      }
    } catch (err) {
      showDialog('error', 'Failed to upload images', 'Error');
    }
  };

  return (
    <>
      <CustomDialog
        visible={dialogVisible}
        type={dialogType}
        title={dialogTitle}
        message={dialogMessage}
        onDismiss={() => setDialogVisible(false)}
        primaryButton={dialogPrimaryButton}
        secondaryButton={dialogSecondaryButton}
      />
      <ScrollView style={styles.container}>
        <View style={styles.content}>
        <Text style={styles.title}>Image Upload Example</Text>
        <Text style={styles.subtitle}>
          Compressed to JPEG and uploaded to S3
        </Text>

        {/* Upload Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, isUploading && styles.buttonDisabled]}
            onPress={handleSingleUpload}
            disabled={isUploading}
          >
            {isUploading ? (
              <ActivityIndicator color={Colors.primary.white} />
            ) : (
              <Text style={styles.buttonText}>Pick & Upload Single Image</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, isUploading && styles.buttonDisabled]}
            onPress={handleMultipleUpload}
            disabled={isUploading}
          >
            {isUploading ? (
              <ActivityIndicator color={Colors.primary.white} />
            ) : (
              <Text style={styles.buttonText}>Pick & Upload Multiple Images</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Progress Indicator */}
        {isUploading && (
          <View style={styles.progressContainer}>
            <Text style={styles.progressText}>Uploading... {progress}%</Text>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${progress}%` }]} />
            </View>
          </View>
        )}

        {/* Error Display */}
        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity onPress={resetError} style={styles.errorButton}>
              <Text style={styles.errorButtonText}>Dismiss</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Uploaded Images Display */}
        {uploadedImages.length > 0 && (
          <View style={styles.imagesContainer}>
            <Text style={styles.imagesTitle}>
              Uploaded Images ({uploadedImages.length})
            </Text>
            <View style={styles.imagesGrid}>
              {uploadedImages.map((img, index) => (
                <View key={index} style={styles.imageCard}>
                  <Image source={{ uri: img.s3Url }} style={styles.image} />
                  <Text style={styles.imageInfo} numberOfLines={1}>
                    {img.width}x{img.height}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Usage Instructions */}
        <View style={styles.instructionsContainer}>
          <Text style={styles.instructionsTitle}>How to use in your code:</Text>
          <View style={styles.codeBlock}>
            <Text style={styles.codeText}>
              {`// Import the hook
import { useImageCompression } from '@/hooks/useImageCompression';

// In your component
const { isUploading, pickAndUploadSingle } = useImageCompression();

// Upload an image
const result = await pickAndUploadSingle();
if (result) {
  console.log('S3 URL:', result.s3Url);
}`}
            </Text>
          </View>
        </View>
      </View>
    </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.parentBackgroundColor,
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.titleColor,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.text.secondary,
    marginBottom: 24,
  },
  buttonContainer: {
    gap: 12,
    marginBottom: 20,
  },
  button: {
    backgroundColor: Colors.primary.red,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 56,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: Colors.primary.white,
    fontSize: 16,
    fontWeight: '600',
  },
  progressContainer: {
    marginBottom: 20,
  },
  progressText: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginBottom: 8,
  },
  progressBar: {
    height: 8,
    backgroundColor: Colors.text.light,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.primary.red,
  },
  errorContainer: {
    backgroundColor: '#FFEBEE',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  errorText: {
    color: '#C62828',
    flex: 1,
    fontSize: 14,
  },
  errorButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  errorButtonText: {
    color: '#C62828',
    fontWeight: '600',
  },
  imagesContainer: {
    marginBottom: 20,
  },
  imagesTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.titleColor,
    marginBottom: 12,
  },
  imagesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  imageCard: {
    width: 100,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: Colors.primary.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  image: {
    width: '100%',
    height: 100,
    resizeMode: 'cover',
  },
  imageInfo: {
    padding: 4,
    fontSize: 10,
    color: Colors.text.secondary,
    textAlign: 'center',
  },
  instructionsContainer: {
    backgroundColor: Colors.primary.white,
    padding: 16,
    borderRadius: 12,
    marginTop: 20,
  },
  instructionsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.titleColor,
    marginBottom: 12,
  },
  codeBlock: {
    backgroundColor: '#F5F5F5',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: Colors.primary.red,
  },
  codeText: {
    fontFamily: 'monospace',
    fontSize: 12,
    color: '#333',
    lineHeight: 18,
  },
});

