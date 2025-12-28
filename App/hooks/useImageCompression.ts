import { useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import {
  pickCompressAndUploadImage,
  pickCompressAndUploadMultipleImages,
  compressAndUploadExistingImage,
  UploadedImageResult,
} from '@/utils/imageCompression';

interface UseImageCompressionResult {
  isUploading: boolean;
  progress: number;
  error: string | null;
  pickAndUploadSingle: (options?: ImagePicker.ImagePickerOptions) => Promise<UploadedImageResult | null>;
  pickAndUploadMultiple: (options?: ImagePicker.ImagePickerOptions) => Promise<UploadedImageResult[]>;
  compressAndUpload: (imageUri: string, quality?: number) => Promise<UploadedImageResult>;
  resetError: () => void;
}

/**
 * React hook for image compression and upload
 * Provides easy-to-use methods for picking, compressing, and uploading images
 */
export function useImageCompression(): UseImageCompressionResult {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const resetError = () => setError(null);

  /**
   * Pick a single image, compress it, and upload to S3
   */
  const pickAndUploadSingle = async (
    options?: ImagePicker.ImagePickerOptions
  ): Promise<UploadedImageResult | null> => {
    try {
      setIsUploading(true);
      setProgress(0);
      setError(null);

      // Request permissions
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        throw new Error('Permission to access media library is required');
      }

      setProgress(10);

      // Pick, compress, and upload
      const result = await pickCompressAndUploadImage(options);
      
      setProgress(100);
      return result;
    } catch (err: any) {
      // console.error('Error in pickAndUploadSingle:', err);
      setError(err.message || 'Failed to upload image');
      return null;
    } finally {
      setIsUploading(false);
      setProgress(0);
    }
  };

  /**
   * Pick multiple images, compress them, and upload to S3
   */
  const pickAndUploadMultiple = async (
    options?: ImagePicker.ImagePickerOptions
  ): Promise<UploadedImageResult[]> => {
    try {
      setIsUploading(true);
      setProgress(0);
      setError(null);

      // Request permissions
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        throw new Error('Permission to access media library is required');
      }

      setProgress(10);

      // Pick, compress, and upload multiple
      const results = await pickCompressAndUploadMultipleImages(options);
      
      setProgress(100);
      return results;
    } catch (err: any) {
      // console.error('Error in pickAndUploadMultiple:', err);
      setError(err.message || 'Failed to upload images');
      return [];
    } finally {
      setIsUploading(false);
      setProgress(0);
    }
  };

  /**
   * Compress and upload an existing image (without picking)
   */
  const compressAndUpload = async (
    imageUri: string,
    quality: number = 0.8
  ): Promise<UploadedImageResult> => {
    try {
      setIsUploading(true);
      setProgress(0);
      setError(null);

      setProgress(10);

      const result = await compressAndUploadExistingImage(imageUri, quality);
      
      setProgress(100);
      return result;
    } catch (err: any) {
      // console.error('Error in compressAndUpload:', err);
      setError(err.message || 'Failed to upload image');
      throw err;
    } finally {
      setIsUploading(false);
      setProgress(0);
    }
  };

  return {
    isUploading,
    progress,
    error,
    pickAndUploadSingle,
    pickAndUploadMultiple,
    compressAndUpload,
    resetError,
  };
}

