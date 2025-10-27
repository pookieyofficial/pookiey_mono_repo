import { ActivityIndicator, StyleSheet, TouchableOpacity, View } from "react-native";
import { Colors } from "@/constants/Colors";
import { ThemedText } from "./ThemedText";

export default function MainButton(props: { title: string, onPress: () => void, disabled?: boolean, type?: 'primary' | 'secondary' }) {
    return (
        <View style={styles.buttonContainer}>
            <TouchableOpacity
                activeOpacity={0.8}
                style={props.type === 'secondary' ? styles.secondaryButton : styles.confirmButton}
                onPress={props.onPress}
                disabled={props.disabled}>
                {props.disabled
                    ?
                    <ActivityIndicator size="small" color={props.type === 'secondary' ? Colors.primaryBackgroundColor : Colors.primary.white} />
                    :
                    <ThemedText type='defaultSemiBold' style={props.type === 'secondary' ? styles.secondaryButtonText : styles.confirmButtonText}>
                        {props.title}
                    </ThemedText>}
            </TouchableOpacity>
        </View>
    )
}

const styles = StyleSheet.create({
    buttonContainer: {
        paddingBottom: 20,
    },
    secondaryButton: {
        backgroundColor: Colors.primary.white,
        borderRadius: 16,
        paddingVertical: 18,
        alignItems: 'center',
        justifyContent: 'center',
    },
    secondaryButtonText: {
        color: Colors.primaryBackgroundColor,
    },
    confirmButtonText: {
        color: Colors.primary.white,
    },
    confirmButton: {
        backgroundColor: Colors.primaryBackgroundColor,
        borderRadius: 16,
        paddingVertical: 18,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: Colors.primaryBackgroundColor,
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
})