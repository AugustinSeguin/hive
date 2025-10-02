import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { LogBox, Platform } from 'react-native';
import { LogBox, Platform } from 'react-native';

import { useColorScheme } from '@/hooks/useColorScheme';
import { useEffect } from 'react';
import { initNotifications, applyNotificationPreferences } from '@/services/notifications';

export const unstable_settings = {
  initialRouteName: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  useEffect(() => {
    // Initialise notifications et applique les préférences (schedules + background fetch)
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
        <Stack.Screen name="addTask" options={{ title: 'Nouvelle tÃ¢che' }} />
        <Stack.Screen name="editTask" options={{ title: 'Modifier la tâche' }} />
        <Stack.Screen name="settings" options={{ title: 'ParamÃ¨tres' }} />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}



