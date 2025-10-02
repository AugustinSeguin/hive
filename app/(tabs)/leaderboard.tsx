import React, { useCallback } from 'react';
import { SafeAreaView, StyleSheet } from 'react-native';
import RankingComponent from '@/components/ranking/RankingComponent';
import SecretGiftComponent from '@/components/ranking/SecretGiftComponent';
import Sizes from '@/constants/Sizes';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';

export default function Leaderboard() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  useFocusEffect(
    useCallback(() => {
      let active = true;
      (async () => {
        const token = await AsyncStorage.getItem('userToken');
        if (!token && active) {
          router.replace('/login');
        }
      })();
      return () => {
        active = false;
      };
    }, [])
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <SecretGiftComponent />
      <RankingComponent />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: Sizes.SPACING_MD,
        paddingTop: Sizes.SPACING_MD,
    },
});
