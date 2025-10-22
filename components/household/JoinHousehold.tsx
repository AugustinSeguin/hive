import { Modal, View, Text, TextInput, TouchableOpacity } from "react-native";
import {useState} from "react";

export default function JoinHouseholdModal({ visible, onClose, onJoin }) {
    const [householdId, setHouseholdId] = useState("");

    return (
        <Modal visible={visible} transparent animationType="slide">
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' }}>
                <View style={{ width: '80%', backgroundColor: '#fff', borderRadius: 16, padding: 20 }}>
                    <Text style={{ fontSize: 18, fontWeight: '700', marginBottom: 10 }}>Rejoindre un foyer</Text>
                    <TextInput
                        placeholder="ID du foyer"
                        value={householdId}
                        onChangeText={setHouseholdId}
                        style={{ borderWidth: 1, borderColor: '#ccc', borderRadius: 10, padding: 10, marginBottom: 20 }}
                    />
                    <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 10 }}>
                        <TouchableOpacity onPress={onClose}>
                            <Text style={{ color: '#e74c3c', fontWeight: '700' }}>Annuler</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => onJoin(householdId)}>
                            <Text style={{ color: '#27ae60', fontWeight: '700' }}>Rejoindre</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
}
