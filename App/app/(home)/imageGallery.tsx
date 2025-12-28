import React from 'react'
import { View, ActivityIndicator, StyleSheet, Alert, Text } from 'react-native'
import { useLocalSearchParams } from 'expo-router'
import { Colors } from '@/constants/Colors'
import ImageGalleryViewer from '@/components/ImageGalleryViewer'

const ImageGallery = () => {
  const { photos, initialIndex } = useLocalSearchParams<{
    photos?: string
    initialIndex?: string
  }>()

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
    // console.error('Error parsing gallery data:', error)
    Alert.alert('Error', 'Failed to load gallery images')
  }

  return (
    <View style={styles.container}>
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

