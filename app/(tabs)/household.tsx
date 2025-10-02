import React, { useCallback } from "react";
import { SafeAreaView, StyleSheet } from "react-native";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import HouseholdList from "@/components/household/HouseholdList";

export default function Household() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? "light"];

  useFocusEffect(
    useCallback(() => {
      let active = true;
      (async () => {
        const token = await AsyncStorage.getItem("userToken");
        if (!token && active) {
          router.replace("/login");
        }
      })();
      return () => {
        active = false;
      };
    }, [])
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <HouseholdList />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "space-between",
    padding: 16,
  },
});
