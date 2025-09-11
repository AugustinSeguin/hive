import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { Colors } from "@/constants/Colors";
import Sizes from "@/constants/Sizes";
import { useColorScheme } from "@/hooks/useColorScheme";

export default function LoginScreen() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const colorScheme = useColorScheme();
    const themeColors = Colors[colorScheme ?? "light"];
    const apiUrl = process.env.EXPO_PUBLIC_API_URL;

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert("Erreur", "Veuillez remplir tous les champs");
            return;
        }

        try {
            const response = await fetch(`${apiUrl}/auth/local`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email, password }),
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || "Erreur de connexion");
            }

            const data = await response.json();
            Alert.alert("Succès", `Connexion OK !\nToken : ${data.token || "pas de token"}`);
        } catch (error: any) {
            Alert.alert("Erreur API", error.message);
        }
    };


    return (
        <View style={[styles.container, { backgroundColor: themeColors.background }]}>
            <Text style={[styles.title, { color: themeColors.text }]}>Connexion</Text>

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
                onPress={handleLogin}
            >
                <Text style={[styles.buttonText, { color: themeColors.background }]}>
                    Se connecter
                </Text>
            </TouchableOpacity>
        </View>
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
