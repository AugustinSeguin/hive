import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Redirect } from 'expo-router';

export default function Gate() {
  const [ready, setReady] = useState(false);
  const [hasToken, setHasToken] = useState<boolean | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const token = await AsyncStorage.getItem('userToken');
        setHasToken(!!token);
      } catch {
        setHasToken(null);
      } finally {
        setReady(true);
      }
    })();
  }, []);

  if (!ready) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator />
      </View>
    );
  }

  if (hasToken) {
    return <Redirect href="/(tabs)" />;
  }

  return <Redirect href="/login" />;
}

