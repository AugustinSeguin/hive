import { Ionicons } from "@expo/vector-icons";
import { useColorScheme } from "@/hooks/useColorScheme";
import { Colors } from "../../constants/Colors";
import { Tabs } from "expo-router";

export default function TabLayout() {
    const colorScheme = useColorScheme();

    return (
        <Tabs
            screenOptions={({ route }) => ({
                tabBarIcon: ({ color, size }) => {
                    let iconName: keyof typeof Ionicons.glyphMap;

                    if (route.name === "index") {
                        iconName = "list-outline";
                    } else if (route.name === "ranking") {
                        iconName = "trophy-outline";
                    } else if (route.name === "household") {
                        iconName = "home-outline";
                    }

                    return <Ionicons name={iconName} size={size} color={color} />;
                },
                tabBarActiveTintColor: Colors[colorScheme ?? "light"].tabIconSelected,
                tabBarInactiveTintColor: Colors[colorScheme ?? "light"].tabIconDefault,
                headerShown: false,
            })}
        >
            <Tabs.Screen name="index" options={{ title: "Tâches" }} />
            <Tabs.Screen name="ranking" options={{ title: "Classement" }} />
            <Tabs.Screen name="household" options={{ title: "Foyer" }} />
        </Tabs>
    );
}
