import React, { useState } from "react";
import {View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, KeyboardAvoidingView} from "react-native";
import { Colors } from "@/constants/Colors";
import Sizes from "@/constants/Sizes";
import { useColorScheme } from "@/hooks/useColorScheme";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function LoginScreen() {
    const [pseudo, setPseudo] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const colorScheme = useColorScheme();
    const themeColors = Colors[colorScheme ?? "light"];
    const apiUrl = process.env.EXPO_PUBLIC_API_URL;

    const handleRegister = async () => {
        if (!pseudo || !email || !password) {
            Alert.alert("Erreur", "Veuillez remplir tous les champs");
            return;
        }

        try {
            const registerResponse = await fetch(`${apiUrl}/auth/local/register`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ pseudo, email, password }),
            });

            if (!registerResponse.ok) {
                const errorText = await registerResponse.text();
                throw new Error(errorText || "Erreur lors de l'inscription");
            }

            const loginResponse = await fetch(`${apiUrl}/auth/local`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });

            if (!loginResponse.ok) {
                const errorText = await loginResponse.text();
                throw new Error(errorText || "Erreur lors de la connexion");
            }

            const loginData = await loginResponse.json();

            await AsyncStorage.setItem("userToken", loginData.token);

            // 4️⃣ Redirection vers la page d'accueil
            router.replace("/");

        } catch (error: any) {
            Alert.alert("Erreur API", error.message);
        }
    };


    return (
        <KeyboardAvoidingView style={[styles.container, { backgroundColor: themeColors.background }]}>
            <Text style={[styles.title, { color: themeColors.text }]}>Inscription</Text>

            <TextInput
                style={[
                    styles.input,
                    {
                        borderColor: themeColors.separator,
                        backgroundColor: themeColors.background,
                        color: themeColors.text,
                    },
                ]}
                placeholder="Pseudo"
                placeholderTextColor={themeColors.secondary}
                autoCapitalize="none"
                value={pseudo}
                onChangeText={setPseudo}
            />

            <TextInput
                style={[
                    styles.input,
                    {
                        borderColor: themeColors.separator,
                        backgroundColor: themeColors.background,
                        color: themeColors.text,
                    },
                ]}
                placeholder="Adresse email"
                placeholderTextColor={themeColors.secondary}
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
            />

            <TextInput
                style={[
                    styles.input,
                    {
                        borderColor: themeColors.separator,
                        backgroundColor: themeColors.background,
                        color: themeColors.text,
                    },
                ]}
                placeholder="Mot de passe"
                placeholderTextColor={themeColors.secondary}
                secureTextEntry
                value={password}
                onChangeText={setPassword}
            />

            <TouchableOpacity
                style={[styles.button, { backgroundColor: themeColors.tint, height: Sizes.BUTTON_HEIGHT_LG }]}
                onPress={handleRegister}
            >
                <Text style={[styles.buttonText, { color: themeColors.background }]}>
                    S'inscrire
                </Text>
            </TouchableOpacity>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: Sizes.SPACING_LG,
    },
    title: {
        fontSize: Sizes.FONT_SIZE_XXL,
        fontWeight: "bold",
        marginBottom: Sizes.SPACING_XL,
    },
    input: {
        width: "100%",
        height: Sizes.INPUT_HEIGHT,
        borderWidth: 1,
        borderRadius: Sizes.INPUT_RADIUS,
        paddingHorizontal: Sizes.SPACING_MD,
        marginBottom: Sizes.SPACING_MD,
    },
    button: {
        width: "100%",
        borderRadius: Sizes.BUTTON_RADIUS,
        alignItems: "center",
        justifyContent: "center",
    },
    buttonText: {
        fontWeight: "bold",
        fontSize: Sizes.FONT_SIZE_MD,
    },
});
