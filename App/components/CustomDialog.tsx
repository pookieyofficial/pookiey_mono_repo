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
    cancelButton?: DialogButton; // Third button for cancel actions 
    autoHide?: number;
}

const getDialogConfig = (type: DialogType) => {
    switch (type) {
        case 'success':
            return {
                color: Colors.primaryBackgroundColor,
                backgroundColor: 'transparent',
            };
        case 'error':
            return {
                color: Colors.primaryBackgroundColor,
                backgroundColor: 'transparent',
            };
        case 'warning':
            return {
                color: Colors.primaryBackgroundColor,
                backgroundColor: 'transparent',
            };
        case 'info':
        default:
            return {
                color: Colors.primaryBackgroundColor,
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
    cancelButton,
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

                <Dialog.Actions style={styles.actionsContainer}>
                    <View style={styles.actionsRow}>
                        {cancelButton && (
                            <Button
                                onPress={cancelButton.onPress}
                                textColor={Colors.text.secondary}
                                labelStyle={styles.cancelButton}
                                style={styles.button}
                            >
                                {cancelButton.text}
                            </Button>
                        )}
                        {secondaryButton && (
                            <Button
                                onPress={secondaryButton.onPress}
                                textColor={Colors.primaryBackgroundColor}
                                labelStyle={styles.secondaryButton}
                                style={styles.button}
                            >
                                {secondaryButton.text}
                            </Button>
                        )}
                        <Button
                            onPress={primaryButton.onPress}
                            textColor={Colors.primaryBackgroundColor}
                            labelStyle={styles.primaryButton}
                            mode="contained"
                            buttonColor={Colors.primaryBackgroundColor}
                            style={styles.button}
                        >
                            {primaryButton.text}
                        </Button>
                    </View>
                </Dialog.Actions>
            </Dialog>
        </Portal>
    );
}

const styles = StyleSheet.create({
    dialog: {
        borderRadius: 20,
        marginHorizontal: 16,
        maxWidth: '100%',
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
        fontFamily: 'HellixBold',
    },
    titleText: {
        fontSize: 20,
        fontFamily: 'HellixBold',
        textAlign: 'left',
        color: Colors.titleColor,
    },
    message: {
        fontSize: 15,
        fontFamily: 'HellixMedium',
        color: Colors.text.primary,
        textAlign: 'left',
        lineHeight: 22,
    },
    primaryButton: {
        fontSize: 15,
        fontFamily: 'HellixSemiBold',
        color: '#FFFFFF',
        paddingHorizontal: 12,
        paddingVertical: 4,
    },
    secondaryButton: {
        fontSize: 15,
        fontFamily: 'HellixSemiBold',
        paddingHorizontal: 10,
        paddingVertical: 4,
    },
    cancelButton: {
        fontSize: 15,
        fontFamily: 'HellixMedium',
        paddingHorizontal: 10,
        paddingVertical: 4,
    },
    actionsContainer: {
        paddingHorizontal: 8,
        paddingBottom: 8,
        paddingTop: 8,
    },
    actionsRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'flex-end',
        alignItems: 'center',
        width: '100%',
    },
    button: {
        minWidth: 70,
        marginLeft: 4,
        marginRight: 4,
        flexShrink: 1,
    },
});
