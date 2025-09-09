import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Button, Dialog, Portal } from 'react-native-paper';
import { Colors } from '@/constants/Colors';

export type DialogType = 'success' | 'error' | 'info' | 'warning';

interface DialogButton {
    text: string;
    onPress: () => void;
}

interface CustomDialogProps {
    visible: boolean;
    type?: DialogType;
    title?: string;
    message: string;
    onDismiss: () => void;
    primaryButton?: DialogButton;
    secondaryButton?: DialogButton;
    autoHide?: number;
}

const getDialogConfig = (type: DialogType) => {
    switch (type) {
        case 'success':
            return {
                color: Colors.primary.red,
                backgroundColor: 'transparent',
            };
        case 'error':
            return {
                color: Colors.primary.red,
                backgroundColor: 'transparent',
            };
        case 'warning':
            return {
                color: '#FF9800',
                backgroundColor: 'transparent',
            };
        case 'info':
        default:
            return {
                color: '#2196F3',
                backgroundColor: 'transparent',
            };
    }
};

export default function CustomDialog({
    visible,
    type = 'info',
    title,
    message,
    onDismiss,
    primaryButton = { text: 'OK', onPress: onDismiss },
    secondaryButton,
    autoHide,
}: CustomDialogProps) {
    const config = getDialogConfig(type);

    useEffect(() => {
        if (visible && autoHide && autoHide > 0) {
            const timer = setTimeout(() => {
                onDismiss();
            }, autoHide);

            return () => clearTimeout(timer);
        }
    }, [visible, autoHide, onDismiss]);

    return (
        <Portal>
            <Dialog
                visible={visible}
                onDismiss={onDismiss}
                style={styles.dialog}
            >
                {title && (
                    <Dialog.Title style={[styles.dialogTitle, { color: config.color }]}>
                        <View style={styles.titleContainer}>
                            {title &&
                                <Text style={[styles.titleText, { color: config.color }]}>
                                    {title}
                                </Text>}
                        </View>
                    </Dialog.Title>
                )}

                <Dialog.Content>
                    <Text style={styles.message}>{message}</Text>
                </Dialog.Content>

                <Dialog.Actions>
                    {secondaryButton && (
                        <Button
                            onPress={secondaryButton.onPress}
                            textColor={Colors.text.secondary}
                            labelStyle={styles.secondaryButton}
                        >
                            {secondaryButton.text}
                        </Button>
                    )}
                    <Button
                        onPress={primaryButton.onPress}
                        textColor={config.color}
                        labelStyle={styles.primaryButton}
                        mode="contained"
                        buttonColor={config.color}
                    >
                        {primaryButton.text}
                    </Button>
                </Dialog.Actions>
            </Dialog>
        </Portal>
    );
}

const styles = StyleSheet.create({
    dialog: {
        borderRadius: 20,
        marginHorizontal: 10,
        backgroundColor: Colors.primary.white,
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.25,
        shadowRadius: 20,
    },
    dialogTitle: {},
    titleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    icon: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    titleText: {
        fontSize: 18,
        fontWeight: '600',
        textAlign: 'left',
    },
    message: {
        fontSize: 14,
        color: Colors.text.secondary,
        textAlign: 'left',
    },
    primaryButton: {
        fontSize: 14,
        fontWeight: '600',
        color: Colors.primary.white,
        paddingHorizontal: 12,

    },
    secondaryButton: {
        fontSize: 16,
        fontWeight: '500',
    },
});
