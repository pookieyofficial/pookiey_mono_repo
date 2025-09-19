import { ActivityIndicator, StyleSheet, TouchableOpacity, View } from "react-native";
import { Colors } from "@/constants/Colors";
import { ThemedText } from "./ThemedText";

export default function MainButton(props: { title: string, onPress: () => void, disabled?: boolean }) {
    return (
        <View style={styles.buttonContainer}>
            <TouchableOpacity
                activeOpacity={0.8}
                style={styles.confirmButton}
                onPress={props.onPress}
                disabled={props.disabled}>
                {props.disabled
                    ?
                    <ActivityIndicator size="small" color="#ffffff" />
                    :
                    <ThemedText type='defaultSemiBold' style={{ color: '#ffffff' }}>
                        {props.title}
                    </ThemedText>}
            </TouchableOpacity>
        </View>
    )
}

const styles = StyleSheet.create({
    buttonContainer: {
        paddingBottom: 40,
    },
    confirmButton: {
        backgroundColor: Colors.primaryBackgroundColor,
        borderRadius: 16,
        paddingVertical: 18,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#E53E3E',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
})