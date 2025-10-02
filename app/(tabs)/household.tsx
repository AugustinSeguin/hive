import {SafeAreaView, TouchableOpacity, StyleSheet} from 'react-native';
import React from "react";
import HouseholdList from "@/components/household/HouseholdList";
import ButtonComponent from "@/components/ButtonComponent";
import { useRouter } from "expo-router";

export default function Household() {
    const router = useRouter();

    return (
        <SafeAreaView style={styles.container}>
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