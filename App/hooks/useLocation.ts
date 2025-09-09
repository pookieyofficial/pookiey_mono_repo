import * as Location from 'expo-location';
import { useState } from 'react';

export function useLocation() {
    const [isLoading, setIsLoading] = useState(false);
    const [hasPermission, setHasPermission] = useState(false);
    const [location, setLocation] = useState<Location.LocationObject | null>(null);
    const [address, setAddress] = useState<string>('');
    const [error, setError] = useState<string>('');

    const requestLocationPermission = async () => {
        setIsLoading(true);
        setError('');
        
        try {
            // Request permission
            const { status } = await Location.requestForegroundPermissionsAsync();
            
            if (status !== 'granted') {
                setError('Permission to access location was denied');
                setIsLoading(false);
                return false;
            }

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
        } catch (error: any) {
            console.error('Error getting location:', error);
            setError('Failed to get location. Please try again.');
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
            console.error('Error getting address:', error);
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
            console.error('Error getting current location:', error);
            setError('Failed to get current location');
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    const checkLocationPermission = async () => {
        const { status } = await Location.getForegroundPermissionsAsync();
        setHasPermission(status === 'granted');
        return status === 'granted';
    };

    const resetLocation = () => {
        setLocation(null);
        setAddress('');
        setError('');
        setHasPermission(false);
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
    };
}
