import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";

export default function TabLayout() {
    return (
        <Tabs
            screenOptions={({ route }) => ({
                tabBarIcon: ({ color, size }) => {
                    let iconName;

                    if (route.name === "index") {
                        iconName = "list-outline";
                    } else if (route.name === "ranking") {
                        iconName = "trophy-outline";
                    } else if (route.name === "household") {
                        iconName = "home-outline";
                    }

                    return <Ionicons name={iconName} size={size} color={color} />;
                },
                tabBarActiveTintColor: "#1d4ed8", // à modifier quand on aura la maquette finale
                tabBarInactiveTintColor: "gray", // à modifier quand on aura la maquette finale
                headerShown: false,
            })}
        >
            <Tabs.Screen name="index" options={{ title: "Tâches" }} />
            <Tabs.Screen name="ranking" options={{ title: "Classement" }} />
            <Tabs.Screen name="household" options={{ title: "Foyer" }} />
        </Tabs>
    );
}