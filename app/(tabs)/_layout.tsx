import { Image, TouchableOpacity, View } from "react-native";
import React, { useEffect, useState } from "react";
import { Tabs, router } from "expo-router";

import AsyncStorage from "@react-native-async-storage/async-storage";
import { Colors } from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import { useColorScheme } from "@/hooks/useColorScheme";

function HeaderAvatar() {
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const colorScheme = useColorScheme();

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem("userProfile");
        if (raw) {
          const parsed = JSON.parse(raw);
          setAvatarUri(parsed?.avatarUri ?? null);
        }
      } catch {
        // ignore
      }
    })();
  }, []);

  const size = 36; // larger avatar in header
  const iconSize = 32;
  const iconColor = colorScheme === "dark" ? "#fff" : "#000";

  return (
    <TouchableOpacity onPress={() => router.push("/profile")} accessibilityLabel="Ouvrir le profil">
      {avatarUri ? (
        <Image source={{ uri: avatarUri }} style={{ width: size, height: size, borderRadius: size / 2 }} />
      ) : (
        <View style={{ width: size, height: size, borderRadius: size / 2, alignItems: "center", justifyContent: "center" }}>
          <Ionicons name="person-circle-outline" size={iconSize} color={iconColor} />
        </View>
      )}
    </TouchableOpacity>
  );
}

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap = "list-outline";

          if (route.name === "index") {
            iconName = "list-outline";
          } else if (route.name === "leaderboard") {
            iconName = "trophy-outline";
          } else if (route.name === "household") {
            iconName = "home-outline";
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: Colors[colorScheme ?? "light"].tabIconSelected,
        tabBarInactiveTintColor: Colors[colorScheme ?? "light"].tabIconDefault,
        headerShown: true,
        headerRight: () => <HeaderAvatar />,
      })}
    >
      <Tabs.Screen name="index" options={{ title: "Liste des tâches", headerShown: true }} />
      <Tabs.Screen name="leaderboard" options={{ title: "Classement", headerShown: true }} />
      <Tabs.Screen name="household" options={{ title: "Foyer", headerShown: true }} />
    </Tabs>
  );
}
