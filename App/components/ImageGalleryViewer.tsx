import React, { useState, useRef } from 'react'
import {
  View,
  Image,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  FlatList,
  NativeScrollEvent,
  NativeSyntheticEvent
} from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons } from '@expo/vector-icons'
import { Colors } from '@/constants/Colors'
import { ThemedText } from './ThemedText'
import { useRouter } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window')

interface ImageGalleryViewerProps {
  photos: string[]
  initialIndex?: number
}

const ImageGalleryViewer: React.FC<ImageGalleryViewerProps> = ({
  photos,
  initialIndex = 0
}) => {
  const router = useRouter()
  const [currentIndex, setCurrentIndex] = useState(initialIndex)
  const flatListRef = useRef<FlatList>(null)
  const thumbnailRef = useRef<ScrollView>(null)

  if (!photos || photos.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color={Colors.primary.white} />
        </TouchableOpacity>
        <View style={styles.emptyContainer}>
          <Ionicons name="image-outline" size={80} color={Colors.text.tertiary} />
        </View>
      </SafeAreaView>
    )
  }


  const handleThumbnailPress = (index: number) => {
    setCurrentIndex(index)
    flatListRef.current?.scrollToIndex({ index, animated: true })
    // Scroll thumbnail into view
    setTimeout(() => {
      thumbnailRef.current?.scrollTo({
        x: (index - 2) * 92,
        animated: true
      })
    }, 100)
  }

  const onScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetX = event.nativeEvent.contentOffset.x
    const index = Math.round(offsetX / SCREEN_WIDTH)
    if (index >= 0 && index < photos.length && index !== currentIndex) {
      setCurrentIndex(index)
      // Auto-scroll thumbnail into view
      setTimeout(() => {
        thumbnailRef.current?.scrollTo({
          x: Math.max(0, (index - 2) * 92),
          animated: true
        })
      }, 100)
    }
  }

  const renderImageItem = ({ item, index }: { item: string; index: number }) => {
    return (
      <View style={styles.imagePage}>
        {/* Background Image (blurred for gradient effect) */}
        <Image
          source={{ uri: item }}
          style={styles.backgroundImage}
          resizeMode="cover"
          blurRadius={30}
        />

        {/* Foreground Image (main image) */}
        <Image
          source={{ uri: item }}
          style={styles.foregroundImage}
          resizeMode="contain"
        />

        {/* Enhanced Gradient overlay */}
        <LinearGradient
          colors={[
            'rgba(0,0,0,0.1)',
            'transparent',
            'transparent',
            'rgba(0,0,0,0.3)',
            'rgba(0,0,0,0.5)'
          ]}
          locations={[0, 0.2, 0.5, 0.8, 1]}
          style={styles.imageOverlay}
        />
      </View>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      
      {/* Swipeable Main Image Section */}
      <FlatList
        ref={flatListRef}
        data={photos}
        renderItem={renderImageItem}
        keyExtractor={(item, index) => `photo-${index}`}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
        initialScrollIndex={initialIndex}
        getItemLayout={(data, index) => ({
          length: SCREEN_WIDTH,
          offset: SCREEN_WIDTH * index,
          index,
        })}
        onScrollToIndexFailed={(info) => {
          // Fallback scroll if index fails
          setTimeout(() => {
            flatListRef.current?.scrollToOffset({ offset: info.averageItemLength * info.index, animated: true })
          }, 100)
        }}
      />

      {/* Back Button - Independent */}
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => router.back()}
      >
        <Ionicons name="chevron-back" size={24} color={Colors.primary.white} />
      </TouchableOpacity>

      {/* Image Counter - Centered */}
      <View style={styles.counterContainer}>
        <View style={styles.counterBackground}>
          <Ionicons name="images" size={16} color={Colors.primary.white} />
          <ThemedText style={[styles.counterText, { color: Colors.primary.white }]}>
            {currentIndex + 1} / {photos.length}
          </ThemedText>
        </View>
      </View>

      {/* Thumbnails Section */}
      <View style={styles.thumbnailsContainer}>
        <ScrollView
          ref={thumbnailRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.thumbnailsScrollContent}
        >
          {photos.map((photo, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.thumbnail,
                index === currentIndex && styles.thumbnailSelected
              ]}
              onPress={() => handleThumbnailPress(index)}
              activeOpacity={0.7}
            >
              <Image
                source={{ uri: photo }}
                style={styles.thumbnailImage}
                resizeMode="cover"
              />
              {index === currentIndex && (
                <View style={styles.thumbnailIndicator} />
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.primary.black,
  },
  imagePage: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT - 120,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.primary.black,
  },
  backgroundImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
    opacity: 0.7,
  },
  foregroundImage: {
    width: '100%',
    height: '100%',
    zIndex: 1,
  },
  imageOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 2,
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 10,
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  counterContainer: {
    position: 'absolute',
    top: 80,
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  counterBackground: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 8,
  },
  counterText: {
    fontSize: 14,
    color: Colors.primary.white,
    fontWeight: '600',
  },
  thumbnailsContainer: {
    height: 120,
    // backgroundColor: Colors.primary.red,
    paddingVertical: 16,
    paddingHorizontal: 10,
  },
  thumbnailsScrollContent: {
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  thumbnail: {
    width: 80,
    height: 80,
    borderRadius: 12,
    marginHorizontal: 6,
    overflow: 'hidden',
    backgroundColor: Colors.text.light,
    borderWidth: 2,
    borderColor: 'transparent',
    opacity: 0.5,
  },
  thumbnailSelected: {
    borderColor: Colors.primary.red,
    borderWidth: 3,
    opacity: 1,
    transform: [{ scale: 1.05 }],
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
  },
  thumbnailIndicator: {
    position: 'absolute',
    bottom: -2,
    left: '50%',
    marginLeft: -4,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary.red,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
})

export default ImageGalleryViewer

