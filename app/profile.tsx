import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity, Alert, Modal, TextInput } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useColorScheme } from "@/hooks/useColorScheme";
import { Colors } from "@/constants/Colors";
import Sizes from "@/constants/Sizes";
import { router } from "expo-router";

type UserProfile = {
  pseudo?: string;
  email?: string;
  avatarUri?: string | null;
};

export default function ProfileScreen() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [urlModalVisible, setUrlModalVisible] = useState(false);
  const [avatarInput, setAvatarInput] = useState("");
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? "light"];

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem("userProfile");
        if (raw) {
          const parsed = JSON.parse(raw);
          setProfile(parsed);
          setAvatarInput(parsed?.avatarUri ?? "");
        }
      } catch {}
    })();
  }, []);

  const logout = async () => {
    try {
      await AsyncStorage.removeItem("userToken");
      await AsyncStorage.removeItem("userProfile");
      router.replace("/login");
    } catch (e) {
      Alert.alert("Erreur", "Impossible de se déconnecter. Réessayez.");
    }
  };

  const displayName = profile?.pseudo || (profile?.email ? profile.email.split('@')[0] : 'Utilisateur');

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.card}>
        <TouchableOpacity
          onPress={() => {
            setAvatarInput(profile?.avatarUri ?? "");
            setUrlModalVisible(true);
          }}
          style={[styles.avatar, { borderColor: theme.separator }]}
          accessibilityLabel="Modifier l'URL de l'avatar"
        >
          {profile?.avatarUri ? (
            <Image source={{ uri: profile.avatarUri }} style={styles.avatarImage} />
          ) : (
            <Text style={{ color: theme.secondary }}>Avatar</Text>
          )}
        </TouchableOpacity>
        <Text style={[styles.name, { color: theme.text }]}>{displayName}</Text>
        <Text style={[styles.email, { color: theme.secondary }]}>{profile?.email || ''}</Text>
      </View>

      <TouchableOpacity style={[styles.logoutBtn, { borderColor: theme.tint }]} onPress={logout}>
        <Text style={[styles.logoutText, { color: theme.tint }]}>Se déconnecter</Text>
      </TouchableOpacity>

      <Modal transparent visible={urlModalVisible} animationType="fade" onRequestClose={() => setUrlModalVisible(false)}>
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalCard, { backgroundColor: theme.background, borderColor: theme.separator }]}> 
            <Text style={[styles.modalTitle, { color: theme.text }]}>URL de l'avatar</Text>
            <TextInput
              style={[styles.modalInput, { borderColor: theme.separator, color: theme.text }]}
              placeholder="https://..."
              placeholderTextColor={theme.secondary}
              autoCapitalize="none"
              autoCorrect={false}
              value={avatarInput}
              onChangeText={setAvatarInput}
            />
            <View style={styles.modalActions}>
              <TouchableOpacity style={[styles.modalButton, { borderColor: theme.separator }]} onPress={() => setUrlModalVisible(false)}>
                <Text style={{ color: theme.secondary }}>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButtonPrimary, { backgroundColor: theme.tint }]}
                onPress={async () => {
                  const trimmed = avatarInput.trim();
                  const isValid = /^https?:\/\//i.test(trimmed) || trimmed === "";
                  if (!isValid) {
                    Alert.alert("URL invalide", "Veuillez saisir une URL commençant par http(s) ou laisser vide.");
                    return;
                  }
                  try {
                    const raw = (await AsyncStorage.getItem("userProfile")) || "{}";
                    const parsed = JSON.parse(raw);
                    const updated: UserProfile = { ...parsed, avatarUri: trimmed || undefined } as UserProfile;
                    await AsyncStorage.setItem("userProfile", JSON.stringify(updated));
                    setProfile(updated);
                    setUrlModalVisible(false);
                  } catch {
                    Alert.alert("Erreur", "Impossible d'enregistrer l'avatar.");
                  }
                }}
              >
                <Text style={{ color: theme.background, fontWeight: '600' }}>Enregistrer</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: Sizes.SPACING_LG,
    alignItems: "center",
  },
  card: {
    alignItems: "center",
    marginTop: Sizes.SPACING_XL,
    gap: Sizes.SPACING_SM,
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  avatarImage: { width: "100%", height: "100%" },
  name: { fontSize: Sizes.FONT_SIZE_XL, fontWeight: "700" },
  email: { fontSize: Sizes.FONT_SIZE_SM },
  logoutBtn: {
    marginTop: Sizes.SPACING_XL,
    paddingVertical: 12,
    paddingHorizontal: Sizes.SPACING_LG,
    borderRadius: Sizes.BUTTON_RADIUS,
    borderWidth: 1,
  },
  logoutText: { fontWeight: "600" },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Sizes.SPACING_LG,
  },
  modalCard: {
    width: '100%',
    maxWidth: 420,
    borderRadius: Sizes.BUTTON_RADIUS,
    borderWidth: 1,
    padding: Sizes.SPACING_LG,
  },
  modalTitle: {
    fontSize: Sizes.FONT_SIZE_LG,
    fontWeight: '700',
    marginBottom: Sizes.SPACING_MD,
  },
  modalInput: {
    borderWidth: 1,
    borderRadius: Sizes.INPUT_RADIUS,
    paddingHorizontal: Sizes.SPACING_MD,
    height: Sizes.INPUT_HEIGHT,
    marginBottom: Sizes.SPACING_MD,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: Sizes.SPACING_MD,
  },
  modalButton: {
    paddingHorizontal: Sizes.SPACING_MD,
    paddingVertical: 10,
    borderRadius: Sizes.BUTTON_RADIUS,
    borderWidth: 1,
  },
  modalButtonPrimary: {
    paddingHorizontal: Sizes.SPACING_MD,
    paddingVertical: 10,
    borderRadius: Sizes.BUTTON_RADIUS,
  },
});
