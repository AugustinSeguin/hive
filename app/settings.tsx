import React, { useEffect, useState } from 'react';
import { View, Text, Switch, StyleSheet, TouchableOpacity, TextInput, Alert, Image } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import Sizes from '@/constants/Sizes';
import { getNotificationSettings, saveNotificationSettings, NotificationSettings } from '@/services/settings';
import { applyBackgroundPreferences } from '@/services/background';
import { applyNotificationPreferences, scheduleTestBurst } from '@/services/notifications';
import {Feather} from "@expo/vector-icons";

const FREQUENCIES = [15, 30, 60];
const apiUrl = process.env.EXPO_PUBLIC_API_URL;

export default function SettingsScreen() {
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'light'];
    const [prefs, setPrefs] = useState<NotificationSettings | null>(null);
    const [pseudo, setPseudo] = useState('');
    const [avatarUri, setAvatarUri] = useState<string | null>(null);

    useEffect(() => {
        (async () => {
            const s = await getNotificationSettings();
            setPrefs(s);

            const token = await AsyncStorage.getItem('userToken');
            if (token) {
                try {
                    const res = await fetch(`${apiUrl}/me`, {
                        headers: { Authorization: `Bearer ${token}` },
                    });
                    if (res.ok) {
                        const data = await res.json();
                        setPseudo(data.pseudo || '');
                        setAvatarUri(data.avatarUrl || null);

                        await AsyncStorage.setItem('userPseudo', data.pseudo || '');
                        if (data.avatarUrl) await AsyncStorage.setItem('userAvatar', data.avatarUrl);
                    }
                } catch (err) {
                    console.error('Erreur récupération profil :', err);
                }
            }
        })();
    }, []);

    const update = async (partial: Partial<NotificationSettings>) => {
        const next = await saveNotificationSettings(partial);
        setPrefs(next);
        await applyBackgroundPreferences();
        await applyNotificationPreferences();
    };

    const pickImage = async () => {
        try {
            const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (!permissionResult.granted) {
                Alert.alert('Permission refusée', 'Vous devez autoriser l’accès à la galerie pour changer l’avatar.');
                return;
            }

            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.7,
            });

            if (!result.canceled && result.assets[0].uri) {
                setAvatarUri(result.assets[0].uri);
            }
        } catch (err) {
            console.error('Erreur sélection image :', err);
        }
    };

    const updateProfile = async () => {
        try {
            const token = await AsyncStorage.getItem('userToken');
            if (!token) {
                Alert.alert('Erreur', 'Vous devez être connecté pour modifier votre profil.');
                return;
            }

            const res = await fetch(`${apiUrl}/me`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ pseudo, avatarUrl: avatarUri }),
            });

            if (!res.ok) throw new Error('Impossible de mettre à jour le profil');

            await AsyncStorage.setItem('userPseudo', pseudo);
            if (avatarUri) await AsyncStorage.setItem('userAvatar', avatarUri);

            Alert.alert('Succès', 'Profil mis à jour !');
        } catch (err) {
            console.error('Erreur mise à jour profil:', err);
            Alert.alert('Erreur', 'Impossible de mettre à jour le profil.');
        }
    };

    if (!prefs) return null;

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <View style={{ alignItems: 'center', marginBottom: Sizes.SPACING_MD }}>
                <TouchableOpacity style={styles.mainAvatar} onPress={pickImage}>
                    {avatarUri ? (
                        <Image source={{ uri: avatarUri }} style={styles.avatarImage} />
                    ) : (
                        <Feather name="user" size={50} color="#888" />
                    )}
                </TouchableOpacity>
                <TextInput
                    style={[styles.pseudoInput, { borderColor: theme.separator, color: theme.text }]}
                    placeholder="Pseudo"
                    placeholderTextColor={theme.secondary}
                    value={pseudo}
                    onChangeText={setPseudo}
                    maxLength={20}
                />
            </View>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Rappels de fond</Text>
            <View style={styles.row}>
                <Text style={[styles.label, { color: theme.text }]}>Activer</Text>
                <Switch value={prefs.enabled} onValueChange={(v) => update({ enabled: v })} />
            </View>

            <Text style={[styles.sectionTitle, { color: theme.text }]}>Fréquence (min)</Text>
            <View style={styles.row}>
                {FREQUENCIES.map((m) => (
                    <TouchableOpacity
                        key={m}
                        style={[
                            styles.chip,
                            { borderColor: theme.separator, backgroundColor: prefs.frequencyMinutes === m ? theme.tint : 'transparent' },
                        ]}
                        onPress={() => update({ frequencyMinutes: m })}
                    >
                        <Text style={{ color: prefs.frequencyMinutes === m ? theme.background : theme.text }}>{m}</Text>
                    </TouchableOpacity>
                ))}
            </View>

            <Text style={[styles.sectionTitle, { color: theme.text }]}>Mode de rappel</Text>
            <View style={styles.row}>
                <TouchableOpacity
                    style={[styles.chip, { borderColor: theme.separator, backgroundColor: theme.tint }]}
                    onPress={() => update({ mode: 'per-task' })}
                >
                    <Text style={{ color: theme.background }}>Par tâche (détaillé)</Text>
                </TouchableOpacity>
            </View>

            <TouchableOpacity style={[styles.testButton, { backgroundColor: theme.tint }]} onPress={updateProfile}>
                <Text style={{ color: theme.background, fontWeight: '600' }}>Mettre à jour le profil</Text>
            </TouchableOpacity>

            <View style={{ height: Sizes.SPACING_LG }} />
            <TouchableOpacity style={[styles.testButton, { backgroundColor: theme.tint }]} onPress={() => scheduleTestBurst()}>
                <Text style={{ color: theme.background, fontWeight: '600' }}>Tester notifications (burst)</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: Sizes.SPACING_LG },
    mainAvatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#eee',
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
        marginBottom: Sizes.SPACING_SM,
    },
    avatarImage: { width: '100%', height: '100%' },
    pseudoInput: {
        width: 150,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderWidth: 1,
        borderRadius: 12,
        textAlign: 'center',
    },
    sectionTitle: { fontSize: Sizes.FONT_SIZE_LG, fontWeight: '700', marginTop: Sizes.SPACING_MD, marginBottom: Sizes.SPACING_SM },
    row: { flexDirection: 'row', alignItems: 'center', gap: 12, flexWrap: 'wrap' },
    label: { fontSize: Sizes.FONT_SIZE_MD },
    chip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999, borderWidth: 1 },
    testButton: { alignItems: 'center', justifyContent: 'center', paddingVertical: 12, borderRadius: Sizes.BUTTON_RADIUS, marginTop: Sizes.SPACING_MD },
    input: { flex: 1, paddingHorizontal: 12, paddingVertical: 8, borderWidth: 1, borderRadius: 12 },
    avatarPicker: { marginTop: Sizes.SPACING_MD, alignItems: 'center', justifyContent: 'center', padding: 12, borderWidth: 1, borderRadius: 12 },
    avatarPreview: { width: 100, height: 100, borderRadius: 50 },
});
