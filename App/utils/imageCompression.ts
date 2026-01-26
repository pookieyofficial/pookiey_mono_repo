import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import * as FileSystem from 'expo-file-system/legacy';
import { Image } from 'react-native';
import { requestPresignedURl, uploadTos3 } from '@/hooks/uploadTos3';

export interface CompressedImageResult {
  uri: string;
  width: number;
  height: number;
  size?: number; // File size in bytes
  mimeType: string;
}

export interface UploadedImageResult {
  localUri: string;
  s3Url: string;
  width: number;
  height: number;
}

/**
 * Compress and convert an image to JPEG without changing dimensions
 * Only changes format and applies compression - preserves original width and height
 * @param imageUri - Local URI of the image
 * @param quality - Compression quality (0-1), default is 0.8
 * @returns Compressed image result with original dimensions preserved
 */
export async function compressImageToJPEG(
  imageUri: string,
  quality: number = 0.8
): Promise<CompressedImageResult> {
  try {
    // Get image dimensions first
    const imageInfo = await FileSystem.getInfoAsync(imageUri);

    // Get original image dimensions
    const originalDimensions = await new Promise<{ width: number; height: number }>((resolve, reject) => {
      Image.getSize(
        imageUri,
        (width, height) => resolve({ width, height }),
        (error) => reject(error)
      );
    });

    const originalWidth = originalDimensions.width;
    const originalHeight = originalDimensions.height;

    // Only compress the image - NO resizing, keep original dimensions
    const manipulatedImage = await ImageManipulator.manipulateAsync(
      imageUri,
      [], // No manipulations - keep original size
      {
        compress: quality,
        format: ImageManipulator.SaveFormat.JPEG,
      }
    );

    // Get the compressed file size
    const compressedInfo = await FileSystem.getInfoAsync(manipulatedImage.uri);
    const compressedSize = compressedInfo.exists ? (compressedInfo as any).size : undefined;

    return {
      uri: manipulatedImage.uri,
      width: manipulatedImage.width,
      height: manipulatedImage.height,
      size: compressedSize,
      mimeType: 'image/jpeg',
    };
  } catch (error) {
    console.error('❌ Error compressing image:', error);
    throw new Error('Failed to compress image');
  }
}

/**
 * Compress multiple images to JPEG without changing dimensions
 * Only changes format and applies compression - preserves original width and height
 * @param imageUris - Array of local URIs
 * @param quality - Compression quality (0-1), default is 0.8
 * @returns Array of compressed image results with original dimensions preserved
 */
export async function compressMultipleImages(
  imageUris: string[],
  quality: number = 0.8
): Promise<CompressedImageResult[]> {
  try {
    const compressedImages = await Promise.all(
      imageUris.map((uri) => compressImageToJPEG(uri, quality))
    );

    return compressedImages;
  } catch (error) {
    console.error('❌ Error compressing multiple images:', error);
    throw new Error('Failed to compress images');
  }
}

/**
 * Pick, compress, and upload an image to S3
 * @param options - Optional picker options
 * @returns Uploaded image result with S3 URL
 */
export async function pickCompressAndUploadImage(
  options?: ImagePicker.ImagePickerOptions
): Promise<UploadedImageResult | null> {
  try {
    // Step 1: Pick image
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1, // Pick at full quality, we'll compress it ourselves
      ...options,
    });

    if (result.canceled) {
      return null;
    }

    const pickedImage = result.assets[0];

    // Step 2: Compress image to JPEG
    const compressedImage = await compressImageToJPEG(pickedImage.uri);

    // Step 3: Request presigned URL
    const presignedUrls = await requestPresignedURl([compressedImage.mimeType]);

    if (!presignedUrls || presignedUrls.length === 0) {
      throw new Error('Failed to get presigned URL');
    }

    const { uploadUrl, fileURL } = presignedUrls[0];

    // Step 4: Upload to S3
    const uploadSuccess = await uploadTos3(
      compressedImage.uri,
      uploadUrl,
      compressedImage.mimeType
    );

    if (!uploadSuccess) {
      throw new Error('Failed to upload image to S3');
    }

    // Clean up temporary compressed file
    try {
      await FileSystem.deleteAsync(compressedImage.uri, { idempotent: true });
    } catch (cleanupError) {
      console.warn('⚠️ Failed to clean up temporary file:', cleanupError);
    }

    return {
      localUri: pickedImage.uri,
      s3Url: fileURL,
      width: compressedImage.width,
      height: compressedImage.height,
    };
  } catch (error) {
    console.error('❌ Error in pick, compress, and upload flow:', error);
    throw error;
  }
}

/**
 * Pick, compress, and upload multiple images to S3
 * @param options - Optional picker options
 * @returns Array of uploaded image results with S3 URLs
 */
export async function pickCompressAndUploadMultipleImages(
  options?: ImagePicker.ImagePickerOptions
): Promise<UploadedImageResult[]> {
  try {
    // Step 1: Pick images
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 1, // Pick at full quality, we'll compress ourselves
      ...options,
    });

    if (result.canceled || !result.assets || result.assets.length === 0) {
      return [];
    }

    // Step 2: Compress all images to JPEG
    const compressedImages = await compressMultipleImages(
      result.assets.map((asset) => asset.uri)
    );

    // Step 3: Request presigned URLs for all images
    const mimeTypes = compressedImages.map((img) => img.mimeType);
    const presignedUrls = await requestPresignedURl(mimeTypes);

    if (!presignedUrls || presignedUrls.length !== compressedImages.length) {
      throw new Error('Failed to get presigned URLs for all images');
    }

    // Step 4: Upload all images to S3
    const uploadPromises = compressedImages.map(async (compressedImage, index) => {
      const { uploadUrl, fileURL } = presignedUrls[index];

      const uploadSuccess = await uploadTos3(
        compressedImage.uri,
        uploadUrl,
        compressedImage.mimeType
      );

      if (!uploadSuccess) {
        throw new Error(`Failed to upload image ${index + 1}`);
      }

      // Clean up temporary compressed file
      try {
        await FileSystem.deleteAsync(compressedImage.uri, { idempotent: true });
      } catch (cleanupError) {
        console.warn(`⚠️ Failed to clean up temporary file ${index + 1}:`, cleanupError);
      }

      return {
        localUri: result.assets[index].uri,
        s3Url: fileURL,
        width: compressedImage.width,
        height: compressedImage.height,
      };
    });

    const uploadedImages = await Promise.all(uploadPromises);

    return uploadedImages;
  } catch (error) {
    console.error('❌ Error in pick, compress, and upload multiple images:', error);
    throw error;
  }
}

/**
 * Compress an existing image URI and upload to S3 (without picking)
 * @param imageUri - Local URI of the image
 * @param quality - Compression quality (0-1), default is 0.8
 * @returns Uploaded image result with S3 URL
 */
export async function compressAndUploadExistingImage(
  imageUri: string,
  quality: number = 0.8
): Promise<UploadedImageResult> {
  try {
    // Step 1: Compress image to JPEG
    const compressedImage = await compressImageToJPEG(imageUri, quality);

    // Step 2: Request presigned URL
    const presignedUrls = await requestPresignedURl([compressedImage.mimeType]);

    if (!presignedUrls || presignedUrls.length === 0) {
      throw new Error('Failed to get presigned URL');
    }

    const { uploadUrl, fileURL } = presignedUrls[0];

    // Step 3: Upload to S3
    const uploadSuccess = await uploadTos3(
      compressedImage.uri,
      uploadUrl,
      compressedImage.mimeType
    );

    if (!uploadSuccess) {
      throw new Error('Failed to upload image to S3');
    }

    // Clean up temporary compressed file
    try {
      await FileSystem.deleteAsync(compressedImage.uri, { idempotent: true });
    } catch (cleanupError) {
      console.warn('⚠️ Failed to clean up temporary file:', cleanupError);
    }

    return {
      localUri: imageUri,
      s3Url: fileURL,
      width: compressedImage.width,
      height: compressedImage.height,
    };
  } catch (error) {
    console.error('❌ Error compressing and uploading existing image:', error);
    throw error;
  }
}

