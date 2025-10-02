import 'react-native-reanimated';

import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { LogBox, Platform } from 'react-native';
import { applyNotificationPreferences, initNotifications } from '@/services/notifications';

import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useEffect } from 'react';

export const unstable_settings = {
  initialRouteName: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  useEffect(() => {

    (async () => {
      await initNotifications();
      await applyNotificationPreferences();
      if (Platform.OS === 'android') { LogBox.ignoreLogs([/expo-notifications:\s*Android Push notifications.*Expo Go/i]); }
    })();
  }, []);

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen name="register" options={{ headerShown: false }} />
        <Stack.Screen name="addTask" options={{ title: 'Nouvelle tâche' }} />
        <Stack.Screen name="editTask" options={{ title: 'Modifier la tache' }} />
        <Stack.Screen name="settings" options={{ title: 'Paramètres' }} />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}



