import { Colors } from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StyleSheet, TouchableOpacity, View, Text } from "react-native";

interface CustomBackButtonProps {
    skipButtonRoute?: string;
}

export default function CustomBackButton({ skipButtonRoute }: CustomBackButtonProps) {
    const router = useRouter();

    return (
        <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                <Ionicons name="chevron-back" size={24} color={Colors.buttonForegroundColor} />
            </TouchableOpacity>

            {skipButtonRoute && (
                <TouchableOpacity onPress={() => router.push(skipButtonRoute as any)} style={styles.skipButton}>
                    <Text style={styles.skipButtonText}>Skip</Text>
                </TouchableOpacity>
            )}
        </View>
    )
}

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center',
        marginTop: 10,
        marginLeft: 10,
        marginBottom: 15,
    },
    backButton: {
        width: 44,
        height: 44,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#f0f0f0',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#ffffff',
    },
    skipButton: {
        flexDirection: 'row',
        alignItems: 'center',
        marginLeft: 'auto',
        marginRight: 15,
    },
    skipButtonText: {
        fontSize: 16,
        color: Colors.primaryForegroundColor,
        fontWeight: '600',
    },
})