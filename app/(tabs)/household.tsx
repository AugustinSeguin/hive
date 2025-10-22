import React from "react";
import { SafeAreaView, StyleSheet } from "react-native";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import HouseholdList from "@/components/household/HouseholdList";
import { useIsFocused } from '@react-navigation/native';

export default function Household() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? "light"];
  const isFocused = useIsFocused();

  // Accès libre: pas de redirection si non authentifié

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <HouseholdList refreshTrigger={isFocused} />
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
