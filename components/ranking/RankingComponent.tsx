import React from 'react';
import {
    View,
    Text,
    FlatList,
    Image,
    StyleSheet,
    TouchableOpacity,
    SafeAreaView,
    useColorScheme,
} from 'react-native';
import { Colors } from '../../constants/Colors';

const DEFAULT_DATA = [
    { id: '1', name: 'Lisa', points: 1420, avatar: 'https://api.dicebear.com/7.x/adventurer/png?seed=Lisa' },
    { id: '2', name: 'Tom', points: 1350, avatar: 'https://api.dicebear.com/7.x/adventurer/png?seed=Tom' },
    { id: '3', name: 'Emilie', points: 1285, avatar: 'https://api.dicebear.com/7.x/adventurer/png?seed=Emilie' },
    { id: '4', name: 'Tim', points: 1200, avatar: 'https://api.dicebear.com/7.x/adventurer/png?seed=Tim' },
];

export default function RankingComponent({ data = DEFAULT_DATA }) {
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'light'];

    const renderItem = ({ item, index }) => (
        <TouchableOpacity style={styles(theme).row} activeOpacity={0.7}>
            <View style={styles(theme).left}>
                <Text style={styles(theme).rank}>{index + 1}</Text>
                <Image source={{ uri: item.avatar }} style={styles(theme).avatar} />
                <View style={styles(theme).nameWrap}>
                    <Text numberOfLines={1} style={styles(theme).name}>
                        {item.name}
                    </Text>
                </View>
            </View>

            <View style={styles(theme).pointsWrap}>
                <Text style={styles(theme).points}>{item.points}</Text>
                <Text style={styles(theme).pointsLabel}>pts</Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles(theme).container}>
            <FlatList
                data={data.sort((a, b) => b.points - a.points)}
                keyExtractor={(item) => item.id}
                renderItem={renderItem}
                ItemSeparatorComponent={() => <View style={styles(theme).sep} />}
                contentContainerStyle={styles(theme).listContent}
            />
        </SafeAreaView>
    );
}

const styles = (theme: typeof Colors.light | typeof Colors.dark) =>
    StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: theme.background,
        },
        listContent: {
            paddingVertical: 8,
        },
        row: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingVertical: 12,
            paddingHorizontal: 16,
        },
        left: {
            flexDirection: 'row',
            alignItems: 'center',
            flex: 1,
        },
        rank: {
            width: 28,
            textAlign: 'center',
            fontWeight: '700',
            fontSize: 16,
            color: theme.muted,
            marginRight: 8,
        },
        avatar: {
            width: 48,
            height: 48,
            borderRadius: 24,
            marginRight: 12,
            backgroundColor: theme.avatarBg,
        },
        nameWrap: {
            flex: 1,
            justifyContent: 'center',
        },
        name: {
            fontSize: 16,
            fontWeight: '600',
            color: theme.text,
        },
        pointsWrap: {
            alignItems: 'flex-end',
            marginLeft: 12,
            minWidth: 64,
        },
        points: {
            fontSize: 16,
            fontWeight: '700',
            color: theme.text,
        },
        pointsLabel: {
            fontSize: 12,
            color: theme.secondary,
        },
        sep: {
            height: StyleSheet.hairlineWidth,
            backgroundColor: theme.separator,
            marginLeft: 56,
        },
    });
