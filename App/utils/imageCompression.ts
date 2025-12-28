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
    // console.log('🔄 Starting image compression...');
    // console.log('Original URI:', imageUri);

    // Get image dimensions first
    const imageInfo = await FileSystem.getInfoAsync(imageUri);
    // console.log('Original file size:', imageInfo.exists ? (imageInfo as any).size : 'unknown');

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
    // console.log('Original dimensions:', originalWidth, 'x', originalHeight);

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

    // console.log('✅ Compression complete');
    // console.log('Compressed URI:', manipulatedImage.uri);
    // console.log('Dimensions (unchanged):', manipulatedImage.width, 'x', manipulatedImage.height);
    // console.log('Compressed size:', compressedSize, 'bytes');

    return {
      uri: manipulatedImage.uri,
      width: manipulatedImage.width,
      height: manipulatedImage.height,
      size: compressedSize,
      mimeType: 'image/jpeg',
    };
  } catch (error) {
    // console.error('❌ Error compressing image:', error);
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
    // console.log(`🔄 Compressing ${imageUris.length} images...`);

    const compressedImages = await Promise.all(
      imageUris.map((uri) => compressImageToJPEG(uri, quality))
    );

    // console.log(`✅ All ${imageUris.length} images compressed`);
    return compressedImages;
  } catch (error) {
    // console.error('❌ Error compressing multiple images:', error);
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
    // console.log('📸 Opening image picker...');
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1, // Pick at full quality, we'll compress it ourselves
      ...options,
    });

    if (result.canceled) {
      // console.log('❌ Image picker canceled');
      return null;
    }

    const pickedImage = result.assets[0];
    // console.log('✅ Image picked:', pickedImage.uri);

    // Step 2: Compress image to JPEG
    const compressedImage = await compressImageToJPEG(pickedImage.uri);

    // Step 3: Request presigned URL
    // console.log('🔄 Requesting presigned URL...');
    const presignedUrls = await requestPresignedURl([compressedImage.mimeType]);

    if (!presignedUrls || presignedUrls.length === 0) {
      throw new Error('Failed to get presigned URL');
    }

    const { uploadUrl, fileURL } = presignedUrls[0];
    // console.log('✅ Presigned URL received');

    // Step 4: Upload to S3
    // console.log('🔄 Uploading to S3...');
    const uploadSuccess = await uploadTos3(
      compressedImage.uri,
      uploadUrl,
      compressedImage.mimeType
    );

    if (!uploadSuccess) {
      throw new Error('Failed to upload image to S3');
    }

    // console.log('✅ Image uploaded successfully');
    // console.log('S3 URL:', fileURL);

    // Clean up temporary compressed file
    try {
      await FileSystem.deleteAsync(compressedImage.uri, { idempotent: true });
    } catch (cleanupError) {
      // console.warn('⚠️ Failed to clean up temporary file:', cleanupError);
    }

    return {
      localUri: pickedImage.uri,
      s3Url: fileURL,
      width: compressedImage.width,
      height: compressedImage.height,
    };
  } catch (error) {
    // console.error('❌ Error in pick, compress, and upload flow:', error);
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
    // console.log('📸 Opening image picker for multiple images...');
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 1, // Pick at full quality, we'll compress ourselves
      ...options,
    });

    if (result.canceled || !result.assets || result.assets.length === 0) {
      // console.log('❌ Image picker canceled or no images selected');
      return [];
    }

    // console.log(`✅ ${result.assets.length} images picked`);

    // Step 2: Compress all images to JPEG
    const compressedImages = await compressMultipleImages(
      result.assets.map((asset) => asset.uri)
    );

    // Step 3: Request presigned URLs for all images
    // console.log('🔄 Requesting presigned URLs...');
    const mimeTypes = compressedImages.map((img) => img.mimeType);
    const presignedUrls = await requestPresignedURl(mimeTypes);

    if (!presignedUrls || presignedUrls.length !== compressedImages.length) {
      throw new Error('Failed to get presigned URLs for all images');
    }

    // console.log('✅ Presigned URLs received');

    // Step 4: Upload all images to S3
    // console.log('🔄 Uploading images to S3...');
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
        // console.warn(`⚠️ Failed to clean up temporary file ${index + 1}:`, cleanupError);
      }

      return {
        localUri: result.assets[index].uri,
        s3Url: fileURL,
        width: compressedImage.width,
        height: compressedImage.height,
      };
    });

    const uploadedImages = await Promise.all(uploadPromises);
    // console.log(`✅ All ${uploadedImages.length} images uploaded successfully`);

    return uploadedImages;
  } catch (error) {
    // console.error('❌ Error in pick, compress, and upload multiple images:', error);
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
    // console.log('🔄 Compressing and uploading existing image...');
    // console.log('Image URI:', imageUri);

    // Step 1: Compress image to JPEG
    const compressedImage = await compressImageToJPEG(imageUri, quality);

    // Step 2: Request presigned URL
    // console.log('🔄 Requesting presigned URL...');
    const presignedUrls = await requestPresignedURl([compressedImage.mimeType]);

    if (!presignedUrls || presignedUrls.length === 0) {
      throw new Error('Failed to get presigned URL');
    }

    const { uploadUrl, fileURL } = presignedUrls[0];
    // console.log('✅ Presigned URL received');

    // Step 3: Upload to S3
    // console.log('🔄 Uploading to S3...');
    const uploadSuccess = await uploadTos3(
      compressedImage.uri,
      uploadUrl,
      compressedImage.mimeType
    );

    if (!uploadSuccess) {
      throw new Error('Failed to upload image to S3');
    }

    // console.log('✅ Image uploaded successfully');
    // console.log('S3 URL:', fileURL);

    // Clean up temporary compressed file
    try {
      await FileSystem.deleteAsync(compressedImage.uri, { idempotent: true });
    } catch (cleanupError) {
      // console.warn('⚠️ Failed to clean up temporary file:', cleanupError);
    }

    return {
      localUri: imageUri,
      s3Url: fileURL,
      width: compressedImage.width,
      height: compressedImage.height,
    };
  } catch (error) {
    // console.error('❌ Error compressing and uploading existing image:', error);
    throw error;
  }
}

