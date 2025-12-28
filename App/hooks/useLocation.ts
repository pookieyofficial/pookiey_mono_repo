import * as Location from 'expo-location';
import { useState, useEffect } from 'react';

export function useLocation() {
    const [isLoading, setIsLoading] = useState(false);
    const [hasPermission, setHasPermission] = useState(false);
    const [location, setLocation] = useState<Location.LocationObject | null>(null);
    const [address, setAddress] = useState<string>('');
    const [error, setError] = useState<string>('');

    // Check permission status on mount
    useEffect(() => {
        checkLocationPermission();
    }, []);

    const requestLocationPermission = async () => {
        setIsLoading(true);
        setError('');
        
        try {
            // console.log('Requesting location permission...');
            
            // Check current permission status first
            const currentPermission = await Location.getForegroundPermissionsAsync();
            // console.log('Current permission status:', currentPermission.status);
            
            if (currentPermission.status === 'granted') {
                // console.log('Permission already granted');
                setHasPermission(true);
                
                // Get current location
                const currentLocation = await Location.getCurrentPositionAsync({
                    accuracy: Location.Accuracy.Balanced,
                });
                setLocation(currentLocation);

                // Get address from coordinates
                await getAddressFromCoordinates(
                    currentLocation.coords.latitude,
                    currentLocation.coords.longitude
                );

                return true;
            }
            
            // Request permission
            // console.log('Requesting new permission...');
            const { status } = await Location.requestForegroundPermissionsAsync();
            // console.log('Permission request result:', status);
            
            if (status !== 'granted') {
                const errorMessage = status === 'denied' 
                    ? 'Location permission was denied. Please enable it in your device settings.' 
                    : 'Permission to access location was denied';
                setError(errorMessage);
                setIsLoading(false);
                return false;
            }

            setHasPermission(true);

            // Get current location
            // console.log('Getting current location...');
            const currentLocation = await Location.getCurrentPositionAsync({
                accuracy: Location.Accuracy.Balanced,
                // timeout: 15000, // 15 second timeout
            });
            // console.log('Got location:', currentLocation.coords);
            setLocation(currentLocation);

            // Get address from coordinates
            await getAddressFromCoordinates(
                currentLocation.coords.latitude,
                currentLocation.coords.longitude
            );

            return true;
        } catch (error: any) {
            // console.error('Error in requestLocationPermission:', error);
            let errorMessage = 'Failed to get location. Please try again.';
            
            if (error.code === 'E_LOCATION_TIMEOUT') {
                errorMessage = 'Location request timed out. Please try again.';
            } else if (error.code === 'E_LOCATION_UNAVAILABLE') {
                errorMessage = 'Location services are unavailable. Please check your device settings.';
            } else if (error.message) {
                errorMessage = error.message;
            }
            
            setError(errorMessage);
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    const getAddressFromCoordinates = async (latitude: number, longitude: number) => {
        try {
            const reverseGeocode = await Location.reverseGeocodeAsync({
                latitude,
                longitude,
            });

            if (reverseGeocode.length > 0) {
                const addressInfo = reverseGeocode[0];
                const addressParts = [
                    addressInfo.street,
                    addressInfo.city,
                    addressInfo.region,
                    addressInfo.postalCode
                ].filter(Boolean);
                
                const formattedAddress = addressParts.join(', ') || 'Address not available';
                setAddress(formattedAddress);
            } else {
                setAddress('Address not available');
            }
        } catch (error) {
            // console.error('Error getting address:', error);
            setAddress('Address not available');
        }
    };

    const getCurrentLocation = async () => {
        if (!hasPermission) {
            return await requestLocationPermission();
        }

        setIsLoading(true);
        try {
            const currentLocation = await Location.getCurrentPositionAsync({
                accuracy: Location.Accuracy.Balanced,
            });
            setLocation(currentLocation);
            await getAddressFromCoordinates(
                currentLocation.coords.latitude,
                currentLocation.coords.longitude
            );
            return true;
        } catch (error: any) {
            // console.error('Error getting current location:', error);
            setError('Failed to get current location');
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    const checkLocationPermission = async () => {
        try {
            // console.log('Checking location permission...');
            const { status } = await Location.getForegroundPermissionsAsync();
            // console.log('Permission check result:', status);
            
            const isGranted = status === 'granted';
            setHasPermission(isGranted);
            
            // If permission is granted, try to get location immediately
            if (isGranted && !location) {
                // console.log('Permission granted, getting location...');
                try {
                    const currentLocation = await Location.getCurrentPositionAsync({
                        accuracy: Location.Accuracy.Balanced,
                        // timeout: 10000,
                    });
                    setLocation(currentLocation);
                    await getAddressFromCoordinates(
                        currentLocation.coords.latitude,
                        currentLocation.coords.longitude
                    );
                } catch (locationError) {
                    // console.log('Could not get location automatically:', locationError);
                    // Don't set error here, just log it
                }
            }
            
            return isGranted;
        } catch (error) {
            // console.error('Error checking location permission:', error);
            return false;
        }
    };

    const resetLocation = () => {
        setLocation(null);
        setAddress('');
        setError('');
        setHasPermission(false);
    };

    const clearError = () => {
        setError('');
    };

    return {
        isLoading,
        hasPermission,
        location,
        address,
        error,
        requestLocationPermission,
        getCurrentLocation,
        checkLocationPermission,
        getAddressFromCoordinates,
        resetLocation,
        clearError,
    };
}
