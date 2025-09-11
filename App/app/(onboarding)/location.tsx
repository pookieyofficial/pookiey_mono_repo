import CustomBackButton from '@/components/CustomBackButton';
import CustomDialog from '@/components/CustomDialog';
import MainButton from '@/components/MainButton';
import { ThemedText } from '@/components/ThemedText';
import { useLocation } from '@/hooks/useLocation';
import { useUser } from '@/hooks/useUser';
import { useAuthStore } from '@/store/authStore';
import { useOnboardingStore } from '@/store/onboardingStore';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    Dimensions,
    SafeAreaView,
    StyleSheet,
    Text,
    View
} from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';


export default function LocationScreen() {
    const {
        isLoading,
        hasPermission,
        location,
        address,
        error,
        requestLocationPermission
    } = useLocation();

    const [showErrorDialog, setShowErrorDialog] = useState(false);
    const { idToken } = useAuthStore();
    const { updateUser } = useUser();
    const { setLocation } = useOnboardingStore();
    const [updatingUser, setUpdatingUser] = useState(false);

    const handleContinue = async () => {
        try {
            setUpdatingUser(true);
            const store = useOnboardingStore.getState();

            const nameParts = store.fullName?.split(' ') || [];
            const firstName = nameParts[0] || '';
            const lastName = nameParts.slice(1).join(' ') || '';

            const profileData = {
                profile: {
                    firstName,
                    lastName,
                    dateOfBirth: store.birthday ? new Date(store.birthday) : undefined,
                    gender: store.gender as "male" | "female" | "other",
                    bio: store.bio,
                    location: {
                        type: "Point" as const,
                        coordinates: location ? [location.coords.longitude, location.coords.latitude] : undefined,
                        city: address,
                    },
                    photos: store.profilePicture ? [{
                        url: store.profilePicture,
                        isPrimary: true,
                        uploadedAt: new Date()
                    }] : [],
                    interests: store.interests || [],
                    occupation: store.occupation,
                    isOnboarded: true
                }
            };

            console.log('Saving onboarding data:', profileData);

            await updateUser(idToken as string, profileData);

            setLocation(address);

            router.replace('/(home)');
        } catch (error) {
            console.error('Error saving user data:', error);
        } finally {
            setUpdatingUser(false);
        }
    };

    const handleAccessLocation = async () => {
        const success = await requestLocationPermission();
        if (!success && error) {
            setShowErrorDialog(true);
        }
    };
    useEffect(() => {
        if (error) {
            setShowErrorDialog(true);
        }
    }, [error]);

    if (hasPermission && location) {
        const mapRegion = {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
        };

        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.content}>
                    <CustomBackButton />

                    <View style={styles.locationHeader}>
                        <ThemedText type="subtitle">
                            {address}
                        </ThemedText>
                    </View>

                    {/* Map View */}
                    <View style={styles.mapContainer}>
                        <MapView
                            style={styles.map}
                            provider={PROVIDER_GOOGLE}
                            region={mapRegion}
                            showsUserLocation={true}
                            showsMyLocationButton={false}
                            showsCompass={false}
                            scrollEnabled={true}
                            zoomEnabled={true}
                            pitchEnabled={false}
                            rotateEnabled={false}
                        >
                            <Marker
                                coordinate={{
                                    latitude: location.coords.latitude,
                                    longitude: location.coords.longitude,
                                }}
                                title="Your Location"
                                description={address || "Current location"}
                            >
                            </Marker>
                        </MapView>
                    </View>
                    <MainButton
                        title="Continue"
                        onPress={handleContinue}
                        disabled={updatingUser}
                    />
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                <CustomBackButton />

                <View style={styles.illustrationContainer}>
                    <View style={styles.illustration}>
                        <View style={[styles.circle, styles.circle1]} />
                        <View style={[styles.circle, styles.circle2]} />
                        <View style={[styles.circle, styles.circle3]} />
                        <View style={styles.locationPinContainer}>
                            <Ionicons name="location" size={60} color="#e74c3c" />
                        </View>
                    </View>
                </View>

                <View style={styles.textContainer}>
                    <ThemedText type="title" style={styles.title}>
                        Enable your location
                    </ThemedText>
                    <ThemedText style={styles.subtitle}>
                        You'll need to enable your location to find people around you
                    </ThemedText>
                </View>

                <View style={styles.spacer} />

                <MainButton
                    title={isLoading ? "Getting location..." : "Allow location access"}
                    onPress={handleAccessLocation}
                    disabled={isLoading}
                />
            </View>

            <CustomDialog
                visible={showErrorDialog}
                type="error"
                message={"Unable to access location. Please allow location access to continue."}
                onDismiss={() => setShowErrorDialog(false)}
                primaryButton={{
                    text: "Try Again",
                    onPress: () => {
                        setShowErrorDialog(false);
                        handleAccessLocation();
                    }
                }}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#ffffff',
    },
    content: {
        flex: 1,
        paddingHorizontal: 24,
        paddingTop: 20,
    },
    illustrationContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginVertical: 40,
    },
    illustration: {
        width: 200,
        height: 200,
        position: 'relative',
        justifyContent: 'center',
        alignItems: 'center',
    },
    circle: {
        position: 'absolute',
        borderRadius: 50,
    },
    circle1: {
        width: 120,
        height: 120,
        backgroundColor: 'rgba(231, 76, 60, 0.2)',
        top: 20,
        left: 40,
    },
    circle2: {
        width: 100,
        height: 100,
        backgroundColor: 'rgba(231, 76, 60, 0.3)',
        top: 10,
        right: 30,
    },
    circle3: {
        width: 80,
        height: 80,
        backgroundColor: 'rgba(231, 76, 60, 0.4)',
        bottom: 30,
        left: 60,
    },
    locationPinContainer: {
        zIndex: 10,
        backgroundColor: '#ffffff',
        borderRadius: 40,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 8,
        elevation: 5,
    },
    textContainer: {
        alignItems: 'center',
        marginBottom: 40,
    },
    title: {
        textAlign: 'center',
        marginBottom: 16,
        letterSpacing: -0.5,
    },
    subtitle: {
        fontSize: 16,
        color: '#666666',
        textAlign: 'center',
        lineHeight: 24,
        paddingHorizontal: 20,
    },
    spacer: {
        flex: 0.5,
    },
    locationHeader: {
        marginBottom: 10,
        alignItems: 'flex-start',
    },
    premiumBadge: {
        fontSize: 14,
        color: '#e74c3c',
        fontWeight: '600',
        marginTop: 8,
        paddingHorizontal: 12,
        paddingVertical: 4,
        backgroundColor: 'rgba(231, 76, 60, 0.1)',
        borderRadius: 12,
        textAlign: 'center',
    },
    mapContainer: {
        flex: 1,
        marginBottom: 10,
        // borderRadius: 16,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 6,
    },
    map: {
        width: '100%',
        height: '100%',
    },
    customMarker: {
        backgroundColor: '#ffffff',
        borderRadius: 20,
        padding: 8,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    locationItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 16,
        paddingHorizontal: 20,
        backgroundColor: '#f8f9fa',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#e9ecef',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    locationIcon: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#ffffff',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    locationDetails: {
        flex: 1,
    },
    coordinatesText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1a1a1a',
        marginBottom: 4,
    },
    addressText: {
        fontSize: 14,
        color: '#666666',
        lineHeight: 20,
    },
});
