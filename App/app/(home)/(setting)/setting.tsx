import React from 'react'
import { 
  View, 
  ScrollView, 
  TouchableOpacity, 
  Image, 
  StyleSheet
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import { Colors } from '../../../constants/Colors'
import { ThemedText } from '@/components/ThemedText'
import { Ionicons } from '@expo/vector-icons'

const Settings = () => {

  const handleButtonPress = (buttonName: string) => {
    console.log(`${buttonName} pressed`)
    // Add navigation logic here
  }

  const handleProfilePress = () => {
    router.push('/(home)/(setting)/profile')
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Settings Header */}
        <View style={styles.headerSection}>
          <ThemedText style={styles.headerTitle}>Settings</ThemedText>
        </View>

        {/* Profile Section */}
        <View style={styles.profileSection}>
          <TouchableOpacity 
            style={styles.profileCard}
            onPress={handleProfilePress}
            activeOpacity={0.8}
          >
            <View style={styles.profileImageContainer}>
              <Image 
                source={{ uri: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face" }}
                style={styles.profileImage}
              />
              <View style={styles.heartIcon}>
                <Ionicons name="heart" size={16} color={Colors.primary.white} />
              </View>
            </View>
            <View style={styles.profileInfo}>
              <ThemedText style={styles.profileName}>Piyush</ThemedText>
              <ThemedText style={styles.profileStatus}>💕 Sometimes you gotta believe in yourself</ThemedText>
            </View>
            <View style={styles.profileArrow}>
              <Ionicons name="chevron-forward" size={20} color={Colors.primary.red} />
            </View>
          </TouchableOpacity>
        </View>

        {/* Settings List */}
        <View style={styles.settingsList}>
          <TouchableOpacity 
            style={styles.settingItem}
            onPress={() => handleButtonPress('Dating Preference')}
            activeOpacity={0.7}
          >
            <View style={styles.settingIconContainer}>
              <Ionicons name="heart-outline" size={24} color={Colors.primary.red} />
            </View>
            <ThemedText style={styles.settingText}>Dating Preference</ThemedText>
            <Ionicons name="chevron-forward" size={18} color={Colors.text.tertiary} />
          </TouchableOpacity>
          
          <View style={styles.decorativeBorder} />

          <TouchableOpacity 
            style={styles.settingItem}
            onPress={() => handleButtonPress('Setting')}
            activeOpacity={0.7}
          >
            <View style={styles.settingIconContainer}>
              <Ionicons name="settings-outline" size={24} color={Colors.primary.red} />
            </View>
            <ThemedText style={styles.settingText}>Account Settings</ThemedText>
            <Ionicons name="chevron-forward" size={18} color={Colors.text.tertiary} />
          </TouchableOpacity>
          
          <View style={styles.decorativeBorder} />

          <TouchableOpacity 
            style={styles.settingItem}
            onPress={() => handleButtonPress('Help Center')}
            activeOpacity={0.7}
          >
            <View style={styles.settingIconContainer}>
              <Ionicons name="help-circle-outline" size={24} color={Colors.primary.red} />
            </View>
            <ThemedText style={styles.settingText}>Help Center</ThemedText>
            <Ionicons name="chevron-forward" size={18} color={Colors.text.tertiary} />
          </TouchableOpacity>
          
          <View style={styles.decorativeBorder} />

          <TouchableOpacity 
            style={styles.settingItem}
            onPress={() => handleButtonPress('Privacy Policy')}
            activeOpacity={0.7}
          >
            <View style={styles.settingIconContainer}>
              <Ionicons name="shield-outline" size={24} color={Colors.primary.red} />
            </View>
            <ThemedText style={styles.settingText}>Privacy Policy</ThemedText>
            <Ionicons name="chevron-forward" size={18} color={Colors.text.tertiary} />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
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
    flexGrow: 1,
    paddingBottom: 20,
  },
  headerSection: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.titleColor,
  },
  profileSection: {
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  profileCard: {
    backgroundColor: Colors.primary.white,
    borderRadius: 20,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.primary.red,
    shadowColor: Colors.primary.red,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  profileImageContainer: {
    position: 'relative',
  },
  profileImage: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 3,
    borderColor: Colors.primary.red,
  },
  heartIcon: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.primary.red,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.primary.white,
  },
  profileInfo: {
    flex: 1,
    marginLeft: 16,
  },
  profileName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: Colors.titleColor,
    marginBottom: 6,
  },
  profileStatus: {
    fontSize: 15,
    color: Colors.text.secondary,
    fontStyle: 'italic',
  },
  profileArrow: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: Colors.secondaryBackgroundColor,
  },
  settingsList: {
    paddingHorizontal: 16,
  },
  settingItem: {
    backgroundColor: Colors.primary.white,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    borderWidth: 1,
    borderColor: Colors.text.light,
  },
  settingIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.secondaryBackgroundColor,
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingText: {
    flex: 1,
    fontSize: 16,
    color: Colors.titleColor,
    fontWeight: '500',
    marginLeft: 12,
  },
  decorativeBorder: {
    height: 1,
    backgroundColor: Colors.primary.red,
    marginVertical: 8,
    marginHorizontal: 20,
    borderRadius: 0.5,
    opacity: 0.3,
  },
})

export default Settings

// import React from 'react'
// import { 
//   View, 
//   ScrollView, 
//   TouchableOpacity, 
//   Image, 
//   StyleSheet
// } from 'react-native'
// import { SafeAreaView } from 'react-native-safe-area-context'
// import { Colors } from '../../../constants/Colors'
// import { ThemedText } from '@/components/ThemedText'
// import { Ionicons } from '@expo/vector-icons'

// const Settings = () => {

//   const handleButtonPress = (buttonName: string) => {
//     console.log(`${buttonName} pressed`)
//     // Add navigation logic here
//   }

//   return (
//     <SafeAreaView style={styles.container}>
//       <ScrollView 
//         style={styles.scrollView} 
//         showsVerticalScrollIndicator={true}
//         contentContainerStyle={styles.scrollContent}
//         bounces={true}
//         alwaysBounceVertical={true}
//         overScrollMode="always"
//         indicatorStyle="default"
//         scrollIndicatorInsets={{ right: 1 }}
//       >
//         {/* Header Section */}
//         <View style={styles.headerSection}>
//           <View style={styles.headerTop}>
//             <ThemedText style={styles.userName}>vikash</ThemedText>
//             <View style={styles.verifiedIcon}>
//               <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
//             </View>
//           </View>
//           <TouchableOpacity style={styles.editButton}>
//             <Ionicons name="pencil" size={14} color="#000" />
//             <ThemedText style={styles.editText}>Edit</ThemedText>
//           </TouchableOpacity>
//         </View>

//         {/* Profile Progress Card */}
//         <View style={styles.profileProgressCard}>
//           <View style={styles.profileHeader}>
//             <Image 
//               source={{ uri: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face" }}
//               style={styles.profileImage}
//             />
//             <View style={styles.profileInfo}>
//               <ThemedText style={styles.progressTitle}>Beginner profile</ThemedText>
//               <ThemedText style={styles.progressPercentage}>39%</ThemedText>
//             </View>
//           </View>
          
//           <View style={styles.progressBarContainer}>
//             <View style={styles.progressBar}>
//               <View style={styles.progressBarFill} />
//             </View>
//           </View>
          
//           <ThemedText style={styles.progressDescription}>
//             By improving your profile, you'll attract more Likes.
//           </ThemedText>
          
//           <View style={styles.buttonContainer}>
//             <TouchableOpacity style={styles.attractivenessButton}>
//               <ThemedText style={styles.attractivenessButtonText}>Increase your attractiveness</ThemedText>
//             </TouchableOpacity>
//           </View>
//         </View>

//         {/* Premium Offer Card */}
//         <View style={styles.premiumCard}>
//           <View style={styles.premiumContent}>
//             <ThemedText style={styles.premiumTitle}>50% off</ThemedText>
//             <ThemedText style={styles.premiumSubtitle}>Off your Premium LoveMatch subscription</ThemedText>
//             <TouchableOpacity style={styles.premiumButton}>
//               <ThemedText style={styles.premiumButtonText}>Expires in 34:37:25</ThemedText>
//             </TouchableOpacity>
//           </View>
//           <View style={styles.premiumDecorations}>
//             <View style={styles.star1} />
//             <View style={styles.star2} />
//             <View style={styles.swirl} />
//           </View>
//         </View>

//         {/* My Boosts Card */}
//         <View style={styles.featureCard}>
//           <View style={styles.featureContent}>
//             <ThemedText style={styles.featureTitle}>My Boosts</ThemedText>
//             <ThemedText style={styles.featureDescription}>Your visibility will skyrocket for 24h</ThemedText>
//             <TouchableOpacity style={styles.boostButton}>
//               <ThemedText style={styles.boostButtonText}>Get a Boost</ThemedText>
//             </TouchableOpacity>
//           </View>
//           <View style={styles.boostIcon}>
//             <Ionicons name="flash" size={32} color="#FF6B35" />
//           </View>
//         </View>

//         {/* My SuperCrushes Card */}
//         <View style={styles.featureCard}>
//           <View style={styles.featureContent}>
//             <ThemedText style={styles.featureTitle}>My SuperCrushes</ThemedText>
//             <ThemedText style={styles.featureDescription}>5x more chances of finding a date</ThemedText>
//             <TouchableOpacity style={styles.superCrushButton}>
//               <ThemedText style={styles.superCrushButtonText}>3 SuperCrushes left</ThemedText>
//             </TouchableOpacity>
//           </View>
//           <View style={styles.superCrushIcon}>
//             <Ionicons name="star" size={32} color="#4A90E2" />
//           </View>
//         </View>

//         {/* Settings Menu */}
//         <View style={styles.menuSection}>
//           <TouchableOpacity 
//             style={styles.menuItem}
//             onPress={() => handleButtonPress('Dating Preferences')}
//             activeOpacity={0.7}
//           >
//             <View style={styles.menuIcon}>
//               <Ionicons name="options-outline" size={20} color="#666" />
//             </View>
//             <ThemedText style={styles.menuText}>Dating preferences</ThemedText>
//             <Ionicons name="chevron-forward" size={18} color="#666" />
//           </TouchableOpacity>

//           <TouchableOpacity 
//             style={styles.menuItem}
//             onPress={() => handleButtonPress('Settings')}
//             activeOpacity={0.7}
//           >
//             <View style={styles.menuIcon}>
//               <Ionicons name="settings-outline" size={20} color="#666" />
//             </View>
//             <ThemedText style={styles.menuText}>Settings</ThemedText>
//             <Ionicons name="chevron-forward" size={18} color="#666" />
//           </TouchableOpacity>

//           <TouchableOpacity 
//             style={styles.menuItem}
//             onPress={() => handleButtonPress('Help Centre')}
//             activeOpacity={0.7}
//           >
//             <View style={styles.menuIcon}>
//               <Ionicons name="help-circle-outline" size={20} color="#666" />
//             </View>
//             <ThemedText style={styles.menuText}>Help centre</ThemedText>
//             <Ionicons name="chevron-forward" size={18} color="#666" />
//           </TouchableOpacity>
//         </View>
//       </ScrollView>
//     </SafeAreaView>
//   )
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#F5F5F5',
//   },
//   scrollView: {
//     flex: 1,
//   },
//   scrollContent: {
//     flexGrow: 1,
//     paddingTop: 20,
//     paddingBottom: 40,
//   },
//   headerSection: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     paddingHorizontal: 16,
//     paddingVertical: 12,
//   },
//   headerTop: {
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   userName: {
//     fontSize: 24,
//     fontWeight: 'bold',
//     color: '#000000',
//     marginRight: 8,
//   },
//   verifiedIcon: {
//     marginLeft: 4,
//   },
//   editButton: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: '#E0E0E0',
//     borderRadius: 8,
//     paddingVertical: 8,
//     paddingHorizontal: 12,
//   },
//   editText: {
//     fontSize: 14,
//     fontWeight: '500',
//     color: '#000000',
//     marginLeft: 4,
//   },
//   profileProgressCard: {
//     backgroundColor: '#FFFFFF',
//     borderRadius: 20,
//     margin: 16,
//     padding: 24,
//     shadowColor: '#000',
//     shadowOffset: {
//       width: 0,
//       height: 8,
//     },
//     shadowOpacity: 0.15,
//     shadowRadius: 12,
//     elevation: 8,
//     borderWidth: 1,
//     borderColor: '#F0F0F0',
//   },
//   profileHeader: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: 20,
//   },
//   profileInfo: {
//     flex: 1,
//     marginLeft: 16,
//   },
//   progressTitle: {
//     fontSize: 18,
//     fontWeight: '400',
//     color: '#000000',
//     marginBottom: 4,
//   },
//   progressPercentage: {
//     fontSize: 28,
//     fontWeight: '500',
//     color: '#E53E3E',
//   },
//   progressBarContainer: {
//     marginBottom: 20,
//     width: '100%',
//   },
//   progressBar: {
//     height: 12,
//     backgroundColor: '#F0F0F0',
//     borderRadius: 6,
//     overflow: 'hidden',
//     shadowColor: '#000',
//     shadowOffset: {
//       width: 0,
//       height: 2,
//     },
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//     elevation: 2,
//   },
//   progressBarFill: {
//     height: '100%',
//     width: '39%',
//     backgroundColor: '#E53E3E',
//     borderRadius: 6,
//     shadowColor: '#E53E3E',
//     shadowOffset: {
//       width: 0,
//       height: 2,
//     },
//     shadowOpacity: 0.3,
//     shadowRadius: 4,
//     elevation: 3,
//   },
//   progressDescription: {
//     fontSize: 15,
//     color: '#666666',
//     marginBottom: 20,
//     lineHeight: 22,
//     textAlign: 'center',
//   },
//   buttonContainer: {
//     alignItems: 'center',
//   },
//   attractivenessButton: {
//     backgroundColor: '#E53E3E',
//     borderRadius: 25,
//     paddingVertical: 12,
//     paddingHorizontal: 24,
//     shadowColor: '#E53E3E',
//     shadowOffset: {
//       width: 0,
//       height: 4,
//     },
//     shadowOpacity: 0.3,
//     shadowRadius: 8,
//     elevation: 6,
//   },
//   attractivenessButtonText: {
//     fontSize: 14,
//     fontWeight: '400',
//     color: '#FFFFFF',
//   },
//   profileImage: {
//     width: 90,
//     height: 90,
//     borderRadius: 16,
//     borderWidth: 3,
//     borderColor: '#E53E3E',
//     shadowColor: '#E53E3E',
//     shadowOffset: {
//       width: 0,
//       height: 4,
//     },
//     shadowOpacity: 0.3,
//     shadowRadius: 8,
//     elevation: 5,
//   },
//   premiumCard: {
//     backgroundColor: '#1A1A1A',
//     borderRadius: 24,
//     margin: 16,
//     padding: 24,
//     position: 'relative',
//     overflow: 'hidden',
//     shadowColor: '#000',
//     shadowOffset: {
//       width: 0,
//       height: 12,
//     },
//     shadowOpacity: 0.4,
//     shadowRadius: 16,
//     elevation: 12,
//     borderWidth: 2,
//     borderColor: '#FFD700',
//   },
//   premiumContent: {
//     zIndex: 2,
//   },
//   premiumTitle: {
//     fontSize: 32,
//     fontWeight: 'bold',
//     color: '#FFFFFF',
//     marginBottom: 8,
//   },
//   premiumSubtitle: {
//     fontSize: 16,
//     color: '#FFFFFF',
//     marginBottom: 20,
//   },
//   premiumButton: {
//     backgroundColor: '#FFD700',
//     borderRadius: 8,
//     paddingVertical: 12,
//     paddingHorizontal: 16,
//     alignSelf: 'flex-start',
//   },
//   premiumButtonText: {
//     fontSize: 14,
//     fontWeight: '600',
//     color: '#000000',
//   },
//   premiumDecorations: {
//     position: 'absolute',
//     bottom: 0,
//     right: 0,
//     width: 100,
//     height: 100,
//   },
//   star1: {
//     position: 'absolute',
//     top: 20,
//     right: 20,
//     width: 8,
//     height: 8,
//     backgroundColor: '#FFD700',
//     borderRadius: 4,
//   },
//   star2: {
//     position: 'absolute',
//     top: 30,
//     right: 10,
//     width: 6,
//     height: 6,
//     backgroundColor: '#FFD700',
//     borderRadius: 3,
//   },
//   swirl: {
//     position: 'absolute',
//     bottom: 10,
//     right: 10,
//     width: 40,
//     height: 2,
//     backgroundColor: '#FFD700',
//     borderRadius: 1,
//     transform: [{ rotate: '45deg' }],
//   },
//   featureCard: {
//     backgroundColor: '#FFFFFF',
//     borderRadius: 20,
//     marginHorizontal: 16,
//     marginBottom: 16,
//     padding: 24,
//     flexDirection: 'row',
//     alignItems: 'center',
//     shadowColor: '#000',
//     shadowOffset: {
//       width: 0,
//       height: 6,
//     },
//     shadowOpacity: 0.15,
//     shadowRadius: 10,
//     elevation: 6,
//     borderWidth: 1,
//     borderColor: '#F0F0F0',
//   },
//   featureContent: {
//     flex: 1,
//   },
//   featureTitle: {
//     fontSize: 20,
//     fontWeight: 'bold',
//     color: '#000000',
//     marginBottom: 4,
//   },
//   featureDescription: {
//     fontSize: 14,
//     color: '#666666',
//     marginBottom: 12,
//   },
//   boostButton: {
//     backgroundColor: '#E0E0E0',
//     borderRadius: 12,
//     paddingVertical: 12,
//     paddingHorizontal: 20,
//     alignSelf: 'flex-start',
//     shadowColor: '#000',
//     shadowOffset: {
//       width: 0,
//       height: 3,
//     },
//     shadowOpacity: 0.2,
//     shadowRadius: 6,
//     elevation: 4,
//   },
//   boostButtonText: {
//     fontSize: 14,
//     fontWeight: '600',
//     color: '#000000',
//   },
//   superCrushButton: {
//     backgroundColor: '#4A90E2',
//     borderRadius: 12,
//     paddingVertical: 12,
//     paddingHorizontal: 20,
//     alignSelf: 'flex-start',
//     shadowColor: '#4A90E2',
//     shadowOffset: {
//       width: 0,
//       height: 4,
//     },
//     shadowOpacity: 0.3,
//     shadowRadius: 8,
//     elevation: 6,
//   },
//   superCrushButtonText: {
//     fontSize: 14,
//     fontWeight: '600',
//     color: '#FFFFFF',
//   },
//   boostIcon: {
//     marginLeft: 16,
//   },
//   superCrushIcon: {
//     marginLeft: 16,
//   },
//   menuSection: {
//     marginTop: 24,
//     paddingHorizontal: 16,
//     backgroundColor: '#FFFFFF',
//     borderRadius: 20,
//     marginHorizontal: 16,
//     shadowColor: '#000',
//     shadowOffset: {
//       width: 0,
//       height: 4,
//     },
//     shadowOpacity: 0.1,
//     shadowRadius: 8,
//     elevation: 4,
//     borderWidth: 1,
//     borderColor: '#F0F0F0',
//   },
//   menuItem: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     paddingVertical: 18,
//     paddingHorizontal: 16,
//     borderBottomWidth: 1,
//     borderBottomColor: '#F5F5F5',
//   },
//   menuIcon: {
//     width: 36,
//     height: 36,
//     borderRadius: 10,
//     backgroundColor: '#F8F8F8',
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginRight: 16,
//     borderWidth: 1,
//     borderColor: '#E8E8E8',
//   },
//   menuText: {
//     flex: 1,
//     fontSize: 16,
//     color: '#000000',
//     fontWeight: '500',
//   },
// })

// export default Settings