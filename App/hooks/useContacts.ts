import * as Contacts from 'expo-contacts';
import { useState } from 'react';
import { DialogType } from '@/components/CustomDialog';

export const useContacts = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [contacts, setContacts] = useState<Contacts.Contact[]>([]);
    const [hasPermission, setHasPermission] = useState(false);

    // Dialog states
    const [dialogVisible, setDialogVisible] = useState(false);
    const [dialogType, setDialogType] = useState<DialogType>('info');
    const [dialogTitle, setDialogTitle] = useState<string>('');
    const [dialogMessage, setDialogMessage] = useState<string>('');
    const [dialogPrimaryButton, setDialogPrimaryButton] = useState<{ text: string; onPress: () => void }>({ text: 'OK', onPress: () => setDialogVisible(false) });
    const [dialogSecondaryButton, setDialogSecondaryButton] = useState<{ text: string; onPress: () => void } | undefined>(undefined);
    const [dialogCancelButton, setDialogCancelButton] = useState<{ text: string; onPress: () => void } | undefined>(undefined);

    // Show dialog helper function
    const showDialog = (
        type: DialogType,
        message: string,
        title?: string,
        primaryButton?: { text: string; onPress: () => void },
        secondaryButton?: { text: string; onPress: () => void },
        cancelButton?: { text: string; onPress: () => void }
    ) => {
        setDialogType(type);
        setDialogTitle(title || '');
        setDialogMessage(message);
        setDialogPrimaryButton(primaryButton || { text: 'OK', onPress: () => setDialogVisible(false) });
        setDialogSecondaryButton(secondaryButton);
        setDialogCancelButton(cancelButton);
        setDialogVisible(true);
    };

    const requestContactsPermission = async (): Promise<boolean> => {
        setIsLoading(true);
        
        try {
            const { status } = await Contacts.requestPermissionsAsync();
            
            if (status === 'granted') {
                console.log('Contact permission granted');
                
                const { data } = await Contacts.getContactsAsync({
                    fields: [Contacts.Fields.Name, Contacts.Fields.PhoneNumbers],
                    
                });
                console.log(JSON.stringify(data[25]))
                
                setContacts(data);
                setHasPermission(true);
                return true;
            } else {
                showDialog(
                    'warning',
                    'To find friends from your contacts, we need access to your contact list. You can enable this in Settings later.',
                    'Permission Required',
                    {
                        text: 'Try Again',
                        onPress: () => {
                            setDialogVisible(false);
                            requestContactsPermission();
                        },
                    },
                    undefined,
                    {
                        text: 'Skip',
                        onPress: () => setDialogVisible(false),
                    }
                );
                return false;
            }
        } catch (error) {
            showDialog('error', 'Something went wrong. Please try again.', 'Error');
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
        // Dialog state for component to render CustomDialog
        dialogVisible,
        dialogType,
        dialogTitle,
        dialogMessage,
        dialogPrimaryButton,
        dialogSecondaryButton,
        dialogCancelButton,
        setDialogVisible,
    };
};
