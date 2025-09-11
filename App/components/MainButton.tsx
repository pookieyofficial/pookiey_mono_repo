import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from "react-native";

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
                    <Text
                        style={styles.confirmButtonText}>
                        {props.title}
                    </Text>}
            </TouchableOpacity>
        </View>
    )
}

const styles = StyleSheet.create({
    buttonContainer: {
        paddingBottom: 40,
    },
    confirmButton: {
        backgroundColor: '#E53E3E',
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
    confirmButtonText: {
        fontSize: 17,
        fontWeight: '700',
        color: '#ffffff',
        letterSpacing: 0.5,
    },
})