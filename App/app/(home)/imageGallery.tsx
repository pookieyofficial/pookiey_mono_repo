import React, { useState } from 'react'
import { View, ActivityIndicator, StyleSheet, Text } from 'react-native'
import { useLocalSearchParams } from 'expo-router'
import { Colors } from '@/constants/Colors'
import ImageGalleryViewer from '@/components/ImageGalleryViewer'
import CustomDialog, { DialogType } from '@/components/CustomDialog'

const ImageGallery = () => {
  const { photos, initialIndex } = useLocalSearchParams<{
    photos?: string
    initialIndex?: string
  }>()
  const [dialogVisible, setDialogVisible] = useState(false)

  let parsedPhotos: string[] = []
  let parsedIndex = 0

  try {
    if (photos) {
      parsedPhotos = JSON.parse(photos)
    }
    if (initialIndex) {
      parsedIndex = parseInt(initialIndex, 10) || 0
    }
  } catch (error) {
    console.error('Error parsing gallery data:', error)
    setDialogVisible(true)
  }

  return (
    <View style={styles.container}>
      <CustomDialog
        visible={dialogVisible}
        type="error"
        title="Error"
        message="Failed to load gallery images"
        onDismiss={() => setDialogVisible(false)}
        primaryButton={{
          text: 'OK',
          onPress: () => setDialogVisible(false),
        }}
      />
      <ImageGalleryViewer photos={parsedPhotos} initialIndex={parsedIndex} />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.primary.black,
  },
})

export default ImageGallery

