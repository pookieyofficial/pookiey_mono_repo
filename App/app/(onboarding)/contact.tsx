import CustomBackButton from '@/components/CustomBackButton';
import MainButton from '@/components/MainButton';
import { ThemedText } from '@/components/ThemedText';
import { Colors } from '@/constants/Colors';
import { useContacts } from '@/hooks/useContacts';
import { Ionicons } from '@expo/vector-icons';
import * as Contacts from 'expo-contacts';
import { useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { useOnboardingStore } from '@/store/onboardingStore';
import {
    FlatList,
    StyleSheet,
    Text,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';


export default function ContactScreen() {

    const { isLoading, contacts, hasPermission, requestContactsPermission } = useContacts();
    const router = useRouter();
    
    useEffect(() => {
        requestContactsPermission();
    }, []);


    const handleContinue = () => {
        router.push('/(onboarding)/notification');
    };

    const handleAccessContacts = async () => {
        await requestContactsPermission();

    };

    const renderContactItem = ({ item }: { item: Contacts.Contact }) => {
        const phoneNumber = item.phoneNumbers?.[0]?.number || 'No phone number';
        const displayName = item.name || 'Unknown Contact';

        return (
            <View style={styles.contactItem}>
                <View style={styles.contactAvatar}>
                    <Ionicons name="person" size={20} color="#666666" />
                </View>
                <View style={styles.contactInfo}>
                    <ThemedText type='defaultSemiBold' style={styles.contactName}>{displayName}</ThemedText>
                    <ThemedText type='default' style={styles.contactPhone}>{phoneNumber}</ThemedText>
                </View>
            </View>
        );
    };

    if (hasPermission && contacts.length > 0) {
        return (
            <SafeAreaView style={styles.container}>
                <CustomBackButton />
                <View style={styles.content}>

                    <View style={styles.contactsHeader}>
                        <ThemedText type="title">
                            Contacts
                        </ThemedText>
                    </View>

                    <FlatList
                        data={contacts}
                        keyExtractor={(item: any, index: any) => item.id || index.toString()}
                        renderItem={renderContactItem}
                        style={styles.contactsList}
                        showsVerticalScrollIndicator={false}
                    />

                    <MainButton
                        title="Continue"
                        onPress={handleContinue}
                        disabled={false}
                    />
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <CustomBackButton skipButtonRoute='/(onboarding)/notification' />
            <View style={styles.content}>

                <View style={styles.illustrationContainer}>
                    <View style={styles.illustration}>
                        <View style={[styles.circle, styles.circle1]} />
                        <View style={[styles.circle, styles.circle2]} />
                        <View style={[styles.circle, styles.circle3]} />
                        <View style={styles.contactPinContainer}>
                            <Ionicons name="person" size={60} color={"white"} />
                        </View>
                    </View>
                </View>

                <View style={styles.textContainer}>
                    <ThemedText type="title" style={styles.title}>
                        Search friends
                    </ThemedText>
                    <ThemedText style={styles.subtitle}>
                        You can find friends from your contact lists to connect
                    </ThemedText>
                </View>

                <View style={styles.spacer} />

                <MainButton
                    title={isLoading ? "Requesting..." : "Access Contacts"}
                    onPress={handleAccessContacts}
                    disabled={isLoading}
                />
            </View>
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
        paddingHorizontal: 20,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'center',
        marginBottom: 13,
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
        backgroundColor: 'rgba(168, 85, 247, 0.8)',
        top: 20,
        left: 40,
    },
    circle2: {
        width: 100,
        height: 100,
        backgroundColor: 'rgba(168, 85, 247, 0.6)',
        top: 10,
        right: 30,
    },
    circle3: {
        width: 80,
        height: 80,
        backgroundColor: 'rgba(168, 85, 247, 0.4)',
        bottom: 30,
        left: 60,
    },
    contactPinContainer: {
        zIndex: 10,
        backgroundColor: 'transparent',
        borderRadius: 40,
        padding: 20,
        shadowColor: Colors.secondaryForegroundColor,
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
        color: Colors.secondaryForegroundColor,
        textAlign: 'center',
        lineHeight: 24,
        paddingHorizontal: 20,
    },
    spacer: {
        flex: 0.5,
    },
    contactsHeader: {
        marginBottom: 24,
    },
    contactsList: {
        flex: 1,
        marginBottom: 20,
    },
    contactItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 16,
        marginBottom: 8,
        backgroundColor: '#f8f9fa',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#e9ecef',
    },
    contactAvatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#e9ecef',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    contactInfo: {
        flex: 1,
    },
    contactName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1a1a1a',
        marginBottom: 2,
    },
    contactPhone: {
        fontSize: 14,
        color: '#666666',
    },
});
