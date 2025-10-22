import React, { useState } from "react";
import { Modal, View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";

export default function JoinHouseholdModal({ visible, onClose, onJoin }) {
    const [householdId, setHouseholdId] = useState("");

    return (
        <Modal visible={visible} transparent animationType="slide">
            <View style={styles.overlay}>
                <View style={styles.container}>
                    <Text style={styles.title}>Rejoindre un foyer</Text>

                    <TextInput
                        placeholder="ID du foyer"
                        value={householdId}
                        onChangeText={setHouseholdId}
                        style={styles.input}
                    />

                    <View style={styles.buttonsRow}>
                        <TouchableOpacity onPress={onClose}>
                            <Text style={styles.cancelText}>Annuler</Text>
                        </TouchableOpacity>

                        <TouchableOpacity onPress={() => onJoin(householdId)}>
                            <Text style={styles.joinText}>Rejoindre</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(0,0,0,0.5)",
    },
    container: {
        width: "80%",
        backgroundColor: "#fff",
        borderRadius: 16,
        padding: 20,
    },
    title: {
        fontSize: 18,
        fontWeight: "700",
        marginBottom: 10,
    },
    input: {
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 10,
        padding: 10,
        marginBottom: 20,
    },
    buttonsRow: {
        flexDirection: "row",
        justifyContent: "flex-end",
        gap: 10,
    },
    cancelText: {
        color: "#e74c3c",
        fontWeight: "700",
    },
    joinText: {
        color: "#27ae60",
        fontWeight: "700",
    },
});
