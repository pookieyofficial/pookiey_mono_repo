// import CustomBackButton from '@/components/CustomBackButton'
// import MainButton from '@/components/MainButton'
// import { ThemedText } from '@/components/ThemedText'
// import React from 'react'
// import {
//     StyleSheet,
//     TouchableOpacity,
//     View,
//     ScrollView,
//     Image,
// } from 'react-native'
// import { SafeAreaView } from 'react-native-safe-area-context'

// const MatchingScreen = () => {
//     const handleSayHello = () => {
//         // Add your logic here for when user says hello
//         console.log('User said hello!')
//     }

//     const handleKeepSwiping = () => {
//         // Add your logic here for when user chooses to keep swiping
//         console.log('User chose to keep swiping')
//     }

//     return (
//         <SafeAreaView style={styles.container}>
//             <CustomBackButton />

//             <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
//                 {/* Profile Cards Section */}
//                 <View style={styles.profileCardsContainer}>
//                     {/* Left Profile Card (Behind) */}
//                     <View style={styles.leftCard}>
//                         <Image
//                             source={{ uri: "https://plus.unsplash.com/premium_photo-1673734625279-2738ecf66fa1?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" }}
//                             style={styles.profileImage}
//                             resizeMode="cover"
//                         />
//                         <View style={styles.heartIconLeft}>
//                             <ThemedText style={styles.heartIcon}>❤️</ThemedText>
//                         </View>
//                     </View>

//                     {/* Right Profile Card (Front) */}
//                     <View style={styles.rightCard}>
//                         <Image
//                             source={{ uri: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" }}
//                             style={styles.profileImage}
//                             resizeMode="cover"
//                         />
//                         <View style={styles.heartIconRight}>
//                             <ThemedText style={styles.heartIcon}>❤️</ThemedText>
//                         </View>
//                     </View>
//                 </View>

//                 {/* Match Message Section */}
//                 <View style={styles.messageContainer}>
//                     <ThemedText style={styles.matchTitle}>It's a match, Jake!</ThemedText>
//                     <ThemedText style={styles.matchSubtitle}>Start a conversation now with each other</ThemedText>
//                 </View>

//                 {/* Action Buttons */}
//                 <View style={styles.buttonContainer}>
//                     <TouchableOpacity
//                         style={styles.sayHelloButton}
//                         onPress={handleSayHello}
//                         activeOpacity={0.8}
//                     >
//                         <ThemedText style={styles.sayHelloText}>Say hello</ThemedText>
//                     </TouchableOpacity>

//                     <TouchableOpacity
//                         style={styles.keepSwipingButton}
//                         onPress={handleKeepSwiping}
//                         activeOpacity={0.7}
//                     >
//                         <ThemedText style={styles.keepSwipingText}>Keep swiping</ThemedText>
//                     </TouchableOpacity>
//                 </View>
//             </ScrollView>
//         </SafeAreaView>
//     )
// }

// const styles = StyleSheet.create({
//     container: {
//         flex: 1,
//         backgroundColor: '#FFFFFF',
//     },
//     content: {
//         flex: 1,
//         paddingHorizontal: 20,
//     },
//     profileCardsContainer: {
//         height: 400,
//         marginTop: 40,
//         marginBottom: 30,
//         position: 'relative',
//     },
//     leftCard: {
//         position: 'absolute',
//         left: 20,
//         top: 40,
//         width: 160,
//         height: 240,
//         borderRadius: 20,
//         overflow: 'hidden',
//         shadowColor: '#000',
//         shadowOffset: {
//             width: 0,
//             height: 4,
//         },
//         shadowOpacity: 0.15,
//         shadowRadius: 8,
//         elevation: 8,
//         transform: [{ rotate: '-8deg' }],
//     },
//     rightCard: {
//         position: 'absolute',
//         right: 20,
//         top: 0,
//         width: 160,
//         height: 240,
//         borderRadius: 20,
//         overflow: 'hidden',
//         shadowColor: '#000',
//         shadowOffset: {
//             width: 0,
//             height: 4,
//         },
//         shadowOpacity: 0.15,
//         shadowRadius: 8,
//         elevation: 8,
//         transform: [{ rotate: '8deg' }],
//     },
//     profileImage: {
//         width: '100%',
//         height: '100%',
//     },
//     heartIconLeft: {
//         position: 'absolute',
//         bottom: 15,
//         left: 15,
//         width: 30,
//         height: 30,
//         borderRadius: 15,
//         backgroundColor: '#FFFFFF',
//         justifyContent: 'center',
//         alignItems: 'center',
//         shadowColor: '#000',
//         shadowOffset: {
//             width: 0,
//             height: 2,
//         },
//         shadowOpacity: 0.1,
//         shadowRadius: 4,
//         elevation: 4,
//     },
//     heartIconRight: {
//         position: 'absolute',
//         top: 15,
//         right: 15,
//         width: 30,
//         height: 30,
//         borderRadius: 15,
//         backgroundColor: '#FFFFFF',
//         justifyContent: 'center',
//         alignItems: 'center',
//         shadowColor: '#000',
//         shadowOffset: {
//             width: 0,
//             height: 2,
//         },
//         shadowOpacity: 0.1,
//         shadowRadius: 4,
//         elevation: 4,
//     },
//     heartIcon: {
//         fontSize: 16,
//     },
//     messageContainer: {
//         alignItems: 'center',
//         marginBottom: 40,
//         paddingHorizontal: 20,
//     },
//     matchTitle: {
//         fontSize: 32,
//         fontWeight: 'bold',
//         color: '#E94057',
//         textAlign: 'center',
//         fontFamily: 'HellixBold',
//         marginBottom: 8,
//     },
//     matchSubtitle: {
//         fontSize: 16,
//         color: '#666666',
//         textAlign: 'center',
//         fontFamily: 'HellixMedium',
//         lineHeight: 22,
//     },
//     buttonContainer: {
//         paddingHorizontal: 20,
//         paddingBottom: 40,
//     },
//     sayHelloButton: {
//         backgroundColor: '#E94057',
//         borderRadius: 25,
//         paddingVertical: 16,
//         alignItems: 'center',
//         marginBottom: 16,
//         shadowColor: '#E94057',
//         shadowOffset: {
//             width: 0,
//             height: 4,
//         },
//         shadowOpacity: 0.3,
//         shadowRadius: 8,
//         elevation: 8,
//     },
//     sayHelloText: {
//         fontSize: 18,
//         fontWeight: 'bold',
//         color: '#FFFFFF',
//         fontFamily: 'HellixBold',
//     },
//     keepSwipingButton: {
//         backgroundColor: '#F8F9FF',
//         borderRadius: 25,
//         paddingVertical: 16,
//         alignItems: 'center',
//         borderWidth: 1,
//         borderColor: '#E94057',
//     },
//     keepSwipingText: {
//         fontSize: 18,
//         fontWeight: 'bold',
//         color: '#E94057',
//         fontFamily: 'HellixBold',
//     },
// })

// export default MatchingScreen



import CustomBackButton from '@/components/CustomBackButton'
import MainButton from '@/components/MainButton'
import { ThemedText } from '@/components/ThemedText'
import React, { useEffect, useRef } from 'react'
import {
    StyleSheet,
    TouchableOpacity,
    View,
    ScrollView,
    Image,
    Animated,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useLocalSearchParams } from 'expo-router'
import { RecommendedUser } from '@/types/User'

const MatchingScreen = () => {
    const { matchData, matchedUser } = useLocalSearchParams()
    
    // Parse the match data
    const match = matchData ? JSON.parse(matchData as string) : null
    const matchedUserData: RecommendedUser | null = matchedUser ? JSON.parse(matchedUser as string) : null
    
    // Default data fallback
    const defaultMatchData = {
        firstName: 'Jake',
        lastName: 'Smith',
        photo: 'https://plus.unsplash.com/premium_photo-1673734625279-2738ecf66fa1?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
    }
    
    const defaultUserData = {
        firstName: 'Emma',
        lastName: 'Johnson',
        photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
    }
    
    // Use actual data if available, otherwise use defaults
    const displayMatchName = matchedUserData?.profile?.firstName || defaultMatchData.firstName
    const displayMatchPhoto = matchedUserData?.profile?.photos?.[0]?.url || defaultMatchData.photo
    const displayUserPhoto = match?.profile?.photos?.[0]?.url || defaultUserData.photo
    const leftCardAnim = useRef(new Animated.Value(0)).current;
    const rightCardAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        // Animate cards when component mounts
        Animated.parallel([
            Animated.spring(leftCardAnim, {
                toValue: 1,
                tension: 50,
                friction: 7,
                useNativeDriver: true,
            }),
            Animated.spring(rightCardAnim, {
                toValue: 1,
                tension: 50,
                friction: 7,
                useNativeDriver: true,
                delay: 100, // slight delay for staggered effect
            })
        ]).start();
    }, [leftCardAnim, rightCardAnim]);

    const handleSayHello = () => {
        console.log('User said hello!')
    }

    const handleKeepSwiping = () => {
        console.log('User chose to keep swiping')
    }

    // Interpolate animation values for left card (coming from left)
    const leftCardTranslateX = leftCardAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [-300, 0] // Start from left off-screen
    });

    const leftCardRotate = leftCardAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['-15deg', '-8deg'] // Start with more rotation
    });

    // Interpolate animation values for right card (coming from right)
    const rightCardTranslateX = rightCardAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [300, 0] // Start from right off-screen
    });

    const rightCardRotate = rightCardAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['15deg', '8deg'] // Start with more rotation
    });

    return (
        <SafeAreaView style={styles.container}>
            <CustomBackButton />

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* Profile Cards Section */}
                <View style={styles.profileCardsContainer}>
                    {/* Left Profile Card (Behind) */}
                    <Animated.View 
                        style={[
                            styles.leftCard,
                            {
                                transform: [
                                    { translateX: leftCardTranslateX },
                                    { rotate: leftCardRotate }
                                ]
                            }
                        ]}
                    >
                        <Image
                            source={{ uri: displayMatchPhoto }}
                            style={styles.profileImage}
                            resizeMode="cover"
                        />
                        <View style={styles.heartIconLeft}>
                            <ThemedText style={styles.heartIcon}>❤️</ThemedText>
                        </View>
                    </Animated.View>

                    {/* Right Profile Card (Front) */}
                    <Animated.View 
                        style={[
                            styles.rightCard,
                            {
                                transform: [
                                    { translateX: rightCardTranslateX },
                                    { rotate: rightCardRotate }
                                ]
                            }
                        ]}
                    >
                        <Image
                            source={{ uri: displayUserPhoto }}
                            style={styles.profileImage}
                            resizeMode="cover"
                        />
                        <View style={styles.heartIconRight}>
                            <ThemedText style={styles.heartIcon}>❤️</ThemedText>
                        </View>
                    </Animated.View>
                </View>

                {/* Match Message Section */}
                <View style={styles.messageContainer}>
                    <ThemedText style={styles.matchTitle}>It's a match, {displayMatchName}!</ThemedText>
                    <ThemedText type='defaultSemiBold' style={styles.matchSubtitle}>Start a conversation now with each other</ThemedText>
                </View>

                {/* Action Buttons */}
                <View style={styles.buttonContainer}>
                    <MainButton title='Say hello' onPress={handleSayHello} />
                    
                   
                    
                    <TouchableOpacity
                        style={styles.laterButton}
                        onPress={handleKeepSwiping}
                        activeOpacity={0.7}
                    >
                        <ThemedText style={styles.laterText}>Later</ThemedText>
                    </TouchableOpacity>
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
    content: {
        flex: 1,
        paddingHorizontal: 20,
    },
    profileCardsContainer: {
        height: 400,
        marginTop: 40,
        marginBottom: 20,
        position: 'relative',
    },
    leftCard: {
        position: 'absolute',
        left: 20,
        top: 40,
        width: 160,
        height: 240,
        borderRadius: 20,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 8,
    },
    rightCard: {
        position: 'absolute',
        right: 20,
        top: 0,
        width: 160,
        height: 240,
        borderRadius: 20,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 8,
    },
    profileImage: {
        width: '100%',
        height: '100%',
    },
    heartIconLeft: {
        position: 'absolute',
        bottom: 15,
        left: 15,
        width: 30,
        height: 30,
        borderRadius: 15,
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 4,
    },
    heartIconRight: {
        position: 'absolute',
        top: 15,
        right: 15,
        width: 30,
        height: 30,
        borderRadius: 15,
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 4,
    },
    heartIcon: {
        fontSize: 16,
    },
    messageContainer: {
        alignItems: 'center',
        marginBottom: 30,
        paddingHorizontal: 20,
    },
    matchTitle: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#E94057',
        textAlign: 'center',
        fontFamily: 'HellixBold',
        marginBottom: 8,
    },
    matchSubtitle: {
        fontSize: 16,
        color: '#666666',
        textAlign: 'center',
        fontFamily: 'HellixMedium',
        lineHeight: 22,
    },
    buttonContainer: {
        paddingHorizontal: 20,
        paddingBottom: 40,
    },
    decorativeLine: {
        alignItems: 'center',
        marginVertical: 20,
        paddingHorizontal: 20,
    },
    line: {
        width: 60,
        height: 1,
        backgroundColor: '#E5E5E5',
    },
    laterButton: {
        alignItems: 'center',
        paddingVertical: 12,
    },
    laterText: {
        fontSize: 16,
        color: '#999999',
        fontFamily: 'HellixMedium',
    },
})

export default MatchingScreen