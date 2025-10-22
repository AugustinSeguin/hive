import React, { useEffect, useState } from 'react';
import { Image, TouchableOpacity, View, Text } from 'react-native';
import { Tabs, router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors } from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from '@/hooks/useColorScheme';

function HeaderActions() {
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem('userProfile');
        if (raw) {
          const parsed = JSON.parse(raw);
          setAvatarUri(parsed?.avatarUri ?? null);
        }
        const token = await AsyncStorage.getItem('userToken');
        setIsAuthenticated(!!token);
      } catch {
        // ignore
      }
    })();
  }, []);

  const size = 32;
  const iconSize = 24;
  const iconColor = theme.text;

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
      <TouchableOpacity
        onPress={() => router.push('/settings')}
        accessibilityLabel="Ouvrir les paramètres"
        style={{ paddingHorizontal: 4, paddingVertical: 4 }}
      >
        <Ionicons name="settings-outline" size={22} color={iconColor} />
      </TouchableOpacity>
      {isAuthenticated ? (
        <TouchableOpacity onPress={() => router.push('/profile')} accessibilityLabel="Ouvrir le profil">
          {avatarUri ? (
            <Image source={{ uri: avatarUri }} style={{ width: size, height: size, borderRadius: size / 2 }} />
          ) : (
            <View style={{ width: size, height: size, borderRadius: size / 2, alignItems: 'center', justifyContent: 'center' }}>
              <Ionicons name="person-circle-outline" size={iconSize} color={iconColor} />
            </View>
          )}
        </TouchableOpacity>
      ) : (
        <TouchableOpacity onPress={() => router.push('/login')} accessibilityLabel="Se connecter" style={{ paddingHorizontal: 8, paddingVertical: 6 }}>
          <Text style={{ color: iconColor, fontWeight: '600' }}>Se connecter</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];

  return (
    <Tabs initialRouteName="index"
      screenOptions={({ route }) => ({
        lazy: true,
        tabBarIcon: ({ color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap = 'list-outline';
          if (route.name === 'index') iconName = 'list-outline';
          else if (route.name === 'leaderboard') iconName = 'trophy-outline';
          else if (route.name === 'household') iconName = 'home-outline';
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: theme.tabIconSelected,
        tabBarInactiveTintColor: theme.tabIconDefault,
        tabBarStyle: { backgroundColor: theme.background, borderTopColor: theme.separator },
        headerShown: true,
        headerStyle: { backgroundColor: theme.background },
        headerTitleStyle: { color: theme.text },
        headerTintColor: theme.text,
        headerRight: () => <HeaderActions />,
      })}
    >
      <Tabs.Screen name="index" options={{ title: 'Liste des tâches', headerShown: true }} />
      <Tabs.Screen name="leaderboard" options={{ title: 'Classement', headerShown: true }} />
      <Tabs.Screen name="household" options={{ title: 'Foyer', headerShown: true }} />
    </Tabs>
  );
}

