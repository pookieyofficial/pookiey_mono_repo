import * as Contacts from 'expo-contacts';
import { useState } from 'react';
import { Alert } from 'react-native';

export const useContacts = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [contacts, setContacts] = useState<Contacts.Contact[]>([]);
    const [hasPermission, setHasPermission] = useState(false);

    const requestContactsPermission = async (): Promise<boolean> => {
        setIsLoading(true);
        
        try {
            const { status } = await Contacts.requestPermissionsAsync();
            
            if (status === 'granted') {
                console.log('Contact permission granted');
                
                const { data } = await Contacts.getContactsAsync({
                    fields: [Contacts.Fields.Name, Contacts.Fields.PhoneNumbers],
                });
                
                setContacts(data);
                setHasPermission(true);
                return true;
            } else {
                Alert.alert(
                    'Permission Required',
                    'To find friends from your contacts, we need access to your contact list. You can enable this in Settings later.',
                    [
                        { text: 'Skip', style: 'cancel' },
                        { text: 'Try Again', onPress: () => requestContactsPermission() }
                    ]
                );
                return false;
            }
        } catch (error) {
            Alert.alert(
                'Error',
                'Something went wrong. Please try again.',
                [{ text: 'OK' }]
            );
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    const resetContacts = () => {
        setContacts([]);
        setHasPermission(false);
        setIsLoading(false);
    };

    return {
        isLoading,
        contacts,
        hasPermission,
        requestContactsPermission,
        resetContacts,
    };
};
