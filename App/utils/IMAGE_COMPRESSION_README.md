# Image Compression and Upload Utility

A comprehensive solution for compressing, converting to JPEG, and uploading images to S3 in your React Native app using Expo.

## Features

- ✅ **Automatic JPEG Conversion**: All images are automatically converted to JPEG format
- ✅ **Smart Compression**: Configurable quality and size reduction
- ✅ **S3 Integration**: Direct upload to AWS S3 using presigned URLs
- ✅ **Batch Processing**: Support for single and multiple image uploads
- ✅ **Progress Tracking**: Real-time upload progress and state management
- ✅ **Error Handling**: Comprehensive error handling with user-friendly messages
- ✅ **Memory Efficient**: Automatic cleanup of temporary files
- ✅ **React Hook**: Easy-to-use React hook for components

## Installation

The required dependencies are already installed:
- `expo-image-manipulator` - For image compression and manipulation
- `expo-image-picker` - For picking images from device
- `expo-file-system` - For file operations

## Quick Start

### Using the React Hook (Recommended)

```typescript
import { useImageCompression } from '@/hooks/useImageCompression';

function MyComponent() {
  const { isUploading, pickAndUploadSingle, error } = useImageCompression();

  const handleUpload = async () => {
    const result = await pickAndUploadSingle({
      allowsEditing: true,
      aspect: [4, 3],
    });

    if (result) {
      // console.log('Uploaded image URL:', result.s3Url);
      // console.log('Image dimensions:', result.width, 'x', result.height);
      // Use result.s3Url to save to your database
    }
  };

  return (
    <TouchableOpacity onPress={handleUpload} disabled={isUploading}>
      <Text>{isUploading ? 'Uploading...' : 'Upload Image'}</Text>
    </TouchableOpacity>
  );
}
```

### Using the Utility Functions Directly

```typescript
import {
  pickCompressAndUploadImage,
  pickCompressAndUploadMultipleImages,
  compressAndUploadExistingImage,
} from '@/utils/imageCompression';

// Single image
const result = await pickCompressAndUploadImage();

// Multiple images
const results = await pickCompressAndUploadMultipleImages();

// Compress existing image URI
const result = await compressAndUploadExistingImage(imageUri, 0.8);
```

## API Reference

### React Hook: `useImageCompression()`

Returns an object with the following properties and methods:

#### Properties
- `isUploading: boolean` - Whether an upload is in progress
- `progress: number` - Upload progress (0-100)
- `error: string | null` - Error message if upload failed

#### Methods

##### `pickAndUploadSingle(options?)`
Pick a single image, compress it, and upload to S3.

**Parameters:**
- `options?: ImagePickerOptions` - Optional image picker configuration

**Returns:** `Promise<UploadedImageResult | null>`

**Example:**
```typescript
const result = await pickAndUploadSingle({
  allowsEditing: true,
  aspect: [16, 9],
});
```

##### `pickAndUploadMultiple(options?)`
Pick multiple images, compress them, and upload to S3.

**Parameters:**
- `options?: ImagePickerOptions` - Optional image picker configuration

**Returns:** `Promise<UploadedImageResult[]>`

**Example:**
```typescript
const results = await pickAndUploadMultiple();
// console.log(`Uploaded ${results.length} images`);
```

##### `compressAndUpload(imageUri, quality?)`
Compress and upload an existing image URI.

**Parameters:**
- `imageUri: string` - Local URI of the image
- `quality?: number` - Compression quality (0-1), default: 0.8

**Returns:** `Promise<UploadedImageResult>`

**Example:**
```typescript
const result = await compressAndUpload('file:///path/to/image.jpg', 0.7);
```

##### `resetError()`
Reset the error state.

---

### Utility Functions

#### `compressImageToJPEG(imageUri, quality?, maxWidth?, maxHeight?)`

Compress and convert an image to JPEG format.

**Parameters:**
- `imageUri: string` - Local URI of the image
- `quality?: number` - Compression quality (0-1), default: 0.8
- `maxWidth?: number` - Maximum width in pixels, default: 1920
- `maxHeight?: number` - Maximum height in pixels, default: 1920

**Returns:** `Promise<CompressedImageResult>`

**Example:**
```typescript
const compressed = await compressImageToJPEG(
  'file:///path/to/image.png',
  0.8,  // 80% quality
  1920, // max width
  1920  // max height
);
// console.log('Compressed size:', compressed.size, 'bytes');
```

#### `compressMultipleImages(imageUris, quality?, maxWidth?, maxHeight?)`

Compress multiple images to JPEG format.

**Parameters:**
- `imageUris: string[]` - Array of local URIs
- `quality?: number` - Compression quality (0-1), default: 0.8
- `maxWidth?: number` - Maximum width in pixels, default: 1920
- `maxHeight?: number` - Maximum height in pixels, default: 1920

**Returns:** `Promise<CompressedImageResult[]>`

#### `pickCompressAndUploadImage(options?)`

Complete flow: Pick → Compress → Upload a single image.

**Parameters:**
- `options?: ImagePickerOptions` - Optional image picker configuration

**Returns:** `Promise<UploadedImageResult | null>`

#### `pickCompressAndUploadMultipleImages(options?)`

Complete flow: Pick → Compress → Upload multiple images.

**Parameters:**
- `options?: ImagePickerOptions` - Optional image picker configuration

**Returns:** `Promise<UploadedImageResult[]>`

#### `compressAndUploadExistingImage(imageUri, quality?)`

Compress and upload an existing image without picking.

**Parameters:**
- `imageUri: string` - Local URI of the image
- `quality?: number` - Compression quality (0-1), default: 0.8

**Returns:** `Promise<UploadedImageResult>`

---

## Type Definitions

### `CompressedImageResult`
```typescript
interface CompressedImageResult {
  uri: string;        // Local URI of compressed image
  width: number;      // Image width in pixels
  height: number;     // Image height in pixels
  size?: number;      // File size in bytes
  mimeType: string;   // Always 'image/jpeg'
}
```

### `UploadedImageResult`
```typescript
interface UploadedImageResult {
  localUri: string;   // Original local URI
  s3Url: string;      // S3 URL of uploaded image
  width: number;      // Image width in pixels
  height: number;     // Image height in pixels
}
```

---

## Complete Examples

### Example 1: Profile Picture Upload

```typescript
import React, { useState } from 'react';
import { View, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useImageCompression } from '@/hooks/useImageCompression';

function ProfilePictureUpload() {
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const { isUploading, pickAndUploadSingle } = useImageCompression();

  const handleUploadProfilePic = async () => {
    const result = await pickAndUploadSingle({
      allowsEditing: true,
      aspect: [1, 1], // Square aspect ratio
    });

    if (result) {
      setProfileImage(result.s3Url);
      // Save to your backend
      await updateUserProfile({ photoURL: result.s3Url });
    }
  };

  return (
    <TouchableOpacity onPress={handleUploadProfilePic} disabled={isUploading}>
      {isUploading ? (
        <ActivityIndicator />
      ) : profileImage ? (
        <Image source={{ uri: profileImage }} style={{ width: 100, height: 100 }} />
      ) : (
        <Text>Upload Profile Picture</Text>
      )}
    </TouchableOpacity>
  );
}
```

### Example 2: Multiple Photo Gallery Upload

```typescript
import React, { useState } from 'react';
import { View, FlatList, Image, TouchableOpacity } from 'react-native';
import { useImageCompression } from '@/hooks/useImageCompression';

function PhotoGalleryUpload() {
  const [photos, setPhotos] = useState<string[]>([]);
  const { isUploading, pickAndUploadMultiple } = useImageCompression();

  const handleUploadPhotos = async () => {
    const results = await pickAndUploadMultiple();

    if (results.length > 0) {
      const s3Urls = results.map(r => r.s3Url);
      setPhotos([...photos, ...s3Urls]);
      // Save to your backend
      await savePhotosToBackend(s3Urls);
    }
  };

  return (
    <View>
      <TouchableOpacity onPress={handleUploadPhotos} disabled={isUploading}>
        <Text>{isUploading ? 'Uploading...' : 'Add Photos'}</Text>
      </TouchableOpacity>

      <FlatList
        data={photos}
        numColumns={3}
        renderItem={({ item }) => (
          <Image source={{ uri: item }} style={{ width: 100, height: 100 }} />
        )}
      />
    </View>
  );
}
```

### Example 3: Story/Post Upload with Custom Quality

```typescript
import React from 'react';
import { useImageCompression } from '@/hooks/useImageCompression';

function CreateStory() {
  const { pickAndUploadSingle, isUploading, error } = useImageCompression();

  const handleCreateStory = async () => {
    // Pick and upload with custom options
    const result = await pickAndUploadSingle({
      allowsEditing: false,
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
    });

    if (result) {
      // Create story with the uploaded image
      await createStory({
        imageUrl: result.s3Url,
        width: result.width,
        height: result.height,
      });
    }
  };

  if (error) {
    return <Text style={{ color: 'red' }}>{error}</Text>;
  }

  return (
    <TouchableOpacity onPress={handleCreateStory} disabled={isUploading}>
      <Text>{isUploading ? 'Uploading Story...' : 'Create Story'}</Text>
    </TouchableOpacity>
  );
}
```

---

## Configuration Options

### Compression Quality

Adjust the quality parameter to balance between file size and image quality:

- `1.0` - Maximum quality (largest file size)
- `0.8` - High quality (recommended default)
- `0.6` - Medium quality
- `0.4` - Low quality (smallest file size)

### Maximum Dimensions

Default maximum dimensions are 1920x1920 pixels. Adjust based on your needs:

```typescript
// For thumbnails
await compressImageToJPEG(uri, 0.7, 500, 500);

// For full-size images
await compressImageToJPEG(uri, 0.9, 2048, 2048);

// For stories (9:16 aspect)
await compressImageToJPEG(uri, 0.8, 1080, 1920);
```

---

## Best Practices

1. **Always handle errors**: Use try-catch or check the error state
2. **Show upload progress**: Display loading indicators to users
3. **Validate images**: Check dimensions and file size before upload
4. **Clean up**: The utility automatically cleans up temporary files
5. **Use appropriate quality**: Higher quality for profile pics, lower for thumbnails
6. **Request permissions**: The hook automatically requests media library permissions

---

## Troubleshooting

### Issue: "Permission to access media library is required"
**Solution:** The hook requests permissions automatically, but ensure your app.json has the required permissions:
```json
{
  "expo": {
    "ios": {
      "infoPlist": {
        "NSPhotoLibraryUsageDescription": "Allow access to select photos"
      }
    },
    "android": {
      "permissions": ["READ_EXTERNAL_STORAGE"]
    }
  }
}
```

### Issue: Upload fails silently
**Solution:** Check your backend logs and ensure presigned URL generation is working correctly.

### Issue: Images are too large
**Solution:** Reduce the quality parameter or maximum dimensions:
```typescript
await compressImageToJPEG(uri, 0.6, 1280, 1280);
```

---

## Performance Tips

1. **Batch uploads**: Use `pickAndUploadMultiple` for better performance
2. **Async operations**: Always use `await` to handle promises correctly
3. **Memory management**: The utility automatically cleans up temporary files
4. **Error boundaries**: Wrap upload operations in try-catch blocks

---

## License

This utility is part of your dating app project and follows the same license.

