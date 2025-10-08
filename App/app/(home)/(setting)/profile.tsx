import React, { useState } from 'react'
import { 
  View, 
  ScrollView, 
  TouchableOpacity, 
  Image, 
  StyleSheet,
  Dimensions
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import { Colors } from '../../../constants/Colors'
import { ThemedText } from '@/components/ThemedText'
import { Ionicons } from '@expo/vector-icons'
import CustomBackButton from '@/components/CustomBackButton'

const { width } = Dimensions.get('window')

const Profile = () => {
  const [isEditing, setIsEditing] = useState(false)

  const handleEdit = () => {
    setIsEditing(!isEditing)
  }

  

  return (
    <SafeAreaView style={styles.container}>
        <CustomBackButton  />
      <ScrollView 
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <View style={styles.header}>
          
          <ThemedText style={styles.headerTitle}>Profile</ThemedText>
        </View>

        {/* Profile Image Section */}
        <View style={styles.profileImageSection}>
          <View style={styles.profileImageContainer}>
            <Image 
              source={{ uri: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop&crop=face" }}
              style={styles.profileImage}
            />
            <TouchableOpacity style={styles.editIconButton} onPress={handleEdit}>
              <Ionicons name="pencil" size={16} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Profile Information Sections */}
        <View style={styles.sectionsContainer}>
          {/* Name Section */}
          <View style={styles.section}>
            <ThemedText style={styles.sectionLabel}>Name</ThemedText>
            <TouchableOpacity style={styles.sectionField} activeOpacity={0.7}>
              <ThemedText style={styles.fieldText}>Piyush</ThemedText>
              <Ionicons name="chevron-forward" size={20} color="#999" />
            </TouchableOpacity>
          </View>

          {/* About Section */}
          <View style={styles.section}>
            <ThemedText style={styles.sectionLabel}>About</ThemedText>
            <TouchableOpacity style={styles.sectionField} activeOpacity={0.7}>
              <ThemedText style={styles.fieldText}>Sometimes you gotta believe..</ThemedText>
              <Ionicons name="chevron-forward" size={20} color="#999" />
            </TouchableOpacity>
          </View>

          {/* Interests Section */}
          <View style={styles.section}>
            <ThemedText style={styles.sectionLabel}>Interests</ThemedText>
            <TouchableOpacity style={styles.sectionField} activeOpacity={0.7}>
              <ThemedText style={styles.fieldText}>Technology, Travel, Coffee</ThemedText>
              <Ionicons name="chevron-forward" size={20} color="#999" />
            </TouchableOpacity>
          </View>

          {/* Photos Section */}
          <View style={styles.section}>
            <ThemedText style={styles.sectionLabel}>Photos</ThemedText>
            <TouchableOpacity style={styles.sectionField} activeOpacity={0.7}>
              <ThemedText style={styles.fieldText}>4 photos</ThemedText>
              <Ionicons name="chevron-forward" size={20} color="#999" />
            </TouchableOpacity>
          </View>

          {/* Dating Preferences Section */}
          <View style={styles.section}>
            <ThemedText style={styles.sectionLabel}>Dating Preferences</ThemedText>
            <TouchableOpacity style={styles.sectionField} activeOpacity={0.7}>
              <ThemedText style={styles.fieldText}>Serious relationship</ThemedText>
              <Ionicons name="chevron-forward" size={20} color="#999" />
            </TouchableOpacity>
          </View>

          {/* Profile Stats Section */}
          <View style={styles.section}>
            <ThemedText style={styles.sectionLabel}>Profile Stats</ThemedText>
            <TouchableOpacity style={styles.sectionField} activeOpacity={0.7}>
              <ThemedText style={styles.fieldText}>156 views, 23 likes</ThemedText>
              <Ionicons name="chevron-forward" size={20} color="#999" />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000000',
  },
  profileImageSection: {
    alignItems: 'center',
    paddingVertical: 20,
    backgroundColor: '#FFFFFF',
  },
  profileImageContainer: {
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  profileImage: {
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 4,
    borderColor: '#E53E3E',
  },
  editIconButton: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E53E3E',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  sectionsContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000000',
    marginBottom: 8,
  },
  sectionField: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  fieldText: {
    fontSize: 16,
    color: '#000000',
    flex: 1,
  },
})

export default Profile
