import { SafeAreaView, StyleSheet } from 'react-native';
import Sizes from '@/constants/Sizes';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function Household() {
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? "light"];

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>

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
