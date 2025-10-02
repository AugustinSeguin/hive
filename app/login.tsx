import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import React, { useState } from "react";
import { Ionicons } from "@expo/vector-icons";

import AsyncStorage from "@react-native-async-storage/async-storage";
import { Colors } from "@/constants/Colors";
import Sizes from "@/constants/Sizes";
import { router } from "expo-router";
import { useColorScheme } from "@/hooks/useColorScheme";

export default function LoginScreen() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
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
            await AsyncStorage.setItem("userToken", data.token);

            router.replace("/");
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

            <View style={styles.inputWrapper}>
                <TextInput
                    style={[
                        styles.input,
                        {
                            borderColor: themeColors.separator,
                            backgroundColor: themeColors.background,
                            color: themeColors.text,
                            paddingRight: Sizes.SPACING_XL + 8,
                        },
                    ]}
                    placeholder="Mot de passe"
                    placeholderTextColor={themeColors.secondary}
                    secureTextEntry={!showPassword}
                    value={password}
                    onChangeText={setPassword}
                />
                <TouchableOpacity
                    accessibilityLabel={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                    onPress={() => setShowPassword((s) => !s)}
                    style={styles.eyeButton}
                >
                    <Ionicons
                        name={showPassword ? "eye-off" : "eye"}
                        size={22}
                        color={themeColors.secondary}
                    />
                </TouchableOpacity>
            </View>

            <TouchableOpacity
                style={[styles.button, { backgroundColor: themeColors.tint, height: Sizes.BUTTON_HEIGHT_LG }]}
                onPress={handleLogin}
            >
                <Text style={[styles.buttonText, { color: themeColors.background }]}> 
                    Se connecter
                </Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={styles.linkButton}
                onPress={() => router.push("/register")}
            >
                <Text style={[styles.linkText, { color: themeColors.tint }]}>
                    Pas de compte ? Créer un compte
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
    inputWrapper: {
        width: "100%",
        marginBottom: Sizes.SPACING_MD,
        position: "relative",
    },
    eyeButton: {
        position: "absolute",
        right: Sizes.SPACING_MD,
        top: 0,
        height: Sizes.INPUT_HEIGHT,
        justifyContent: "center",
        alignItems: "center",
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
    linkButton: {
        marginTop: Sizes.SPACING_MD,
    },
    linkText: {
        fontSize: Sizes.FONT_SIZE_SM,
        fontWeight: "600",
    },
});
