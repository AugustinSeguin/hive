import React, { useState } from "react";
import { View, Text, Modal, TouchableOpacity, StyleSheet, Image, TextInput, Button, Alert } from "react-native";
import { Feather } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";

export default function EditHouseholdModal({ visible, onClose, onSave, initialName, initialAvatar }) {
    const [name, setName] = useState(initialName || "");
    const [avatarUri, setAvatarUri] = useState(initialAvatar || null);

    const openImagePicker = async () => {
        const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permission.granted) {
            Alert.alert("Permission refusée", "Activez l'accès aux photos dans les paramètres.");
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.7,
        });

        if (!result.canceled) {
            setAvatarUri(result.assets[0].uri);
        }
    };

    const handleSave = () => {
        if (name.trim() === "") {
            Alert.alert("Erreur", "Le nom du foyer ne peut pas être vide.");
            return;
        }
        onSave({ name, avatar: avatarUri });
        onClose();
    };

    return (
        <Modal visible={visible} transparent animationType="slide">
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    <Text style={styles.modalTitle}>Modifier le foyer</Text>

                    <TouchableOpacity onPress={openImagePicker} style={styles.avatarPicker}>
                        {avatarUri ? (
                            <Image source={{ uri: avatarUri }} style={styles.avatarPreview} />
                        ) : (
                            <Feather name="image" size={40} color="#888" />
                        )}
                        <Text style={{ marginTop: 6 }}>Changer l’avatar</Text>
                    </TouchableOpacity>

                    <TextInput
                        style={styles.input}
                        placeholder="Nom du foyer"
                        value={name}
                        onChangeText={setName}
                    />

                    <View style={styles.modalButtons}>
                        <Button title="Annuler" onPress={onClose} />
                        <Button title="Sauvegarder" onPress={handleSave} />
                    </View>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(0,0,0,0.5)",
    },
    modalContent: {
        backgroundColor: "#fff",
        borderRadius: 16,
        padding: 20,
        width: "80%",
        alignItems: "center",
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: "700",
        marginBottom: 12,
    },
    input: {
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 8,
        padding: 10,
        width: "100%",
        marginTop: 12,
    },
    modalButtons: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 20,
        width: "100%",
    },
    avatarPicker: {
        alignItems: "center",
        marginBottom: 12,
    },
    avatarPreview: {
        width: 80,
        height: 80,
        borderRadius: 40,
    },
});
