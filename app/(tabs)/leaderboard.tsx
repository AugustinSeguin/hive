import React from 'react';
import { SafeAreaView, StyleSheet } from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import RankingComponent from '@/components/ranking/RankingComponent';
import SecretGiftComponent from '@/components/ranking/SecretGiftComponent';
import Sizes from '@/constants/Sizes';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function Leaderboard() {
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'light'];
    const isFocused = useIsFocused(); // <-- focus de l'écran

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
            <SecretGiftComponent />
            <RankingComponent refreshTrigger={isFocused} />
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
