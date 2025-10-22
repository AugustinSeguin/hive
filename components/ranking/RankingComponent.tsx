import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    FlatList,
    Image,
    StyleSheet,
    TouchableOpacity,
    SafeAreaView,
    ActivityIndicator,
} from 'react-native';
import { Colors } from '@/constants/Colors';
import Sizes from '@/constants/Sizes';
import AsyncStorage from '@react-native-async-storage/async-storage';

const apiUrl = process.env.EXPO_PUBLIC_API_URL;

const DEFAULT_DATA = [
    { id: '1', name: 'Lisa', points: 1420, avatar: 'https://api.dicebear.com/7.x/adventurer/png?seed=Lisa' },
    { id: '2', name: 'Tom', points: 1350, avatar: 'https://api.dicebear.com/7.x/adventurer/png?seed=Tom' },
    { id: '3', name: 'Emilie', points: 1285, avatar: 'https://api.dicebear.com/7.x/adventurer/png?seed=Emilie' },
    { id: '4', name: 'Tim', points: 1200, avatar: 'https://api.dicebear.com/7.x/adventurer/png?seed=Tim' },
];

export default function RankingComponent({ refreshTrigger }) {
    const theme = Colors['light'];

    const [ranking, setRanking] = useState(DEFAULT_DATA);
    const [loading, setLoading] = useState(true);
    const [hasRealData, setHasRealData] = useState(false);

    useEffect(() => {
        const fetchRanking = async () => {
            try {
                const token = await AsyncStorage.getItem('userToken');
                const householdId = await AsyncStorage.getItem('householdId');

                if (!token || !householdId) {
                    setRanking(DEFAULT_DATA);
                    setHasRealData(false);
                    setLoading(false);
                    return;
                }

                const res = await fetch(`${apiUrl}/households/${householdId}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (!res.ok) throw new Error('Erreur de récupération du classement');
                const data = await res.json();

                if (!data.members || data.members.length === 0) {
                    setRanking(DEFAULT_DATA);
                    setHasRealData(false);
                    setLoading(false);
                    return;
                }

                const formatted = data.members.map((m) => ({
                    id: m.id.toString(),
                    name: m.pseudo,
                    points: m.points || 0,
                    avatar:
                        m.avatarUrl ||
                        `https://api.dicebear.com/7.x/adventurer/png?seed=${m.pseudo}`,
                }));

                formatted.sort((a, b) => b.points - a.points);
                setRanking(formatted);
                setHasRealData(true);
            } catch (err) {
                console.error('Erreur chargement classement :', err);
                setRanking(DEFAULT_DATA);
                setHasRealData(false);
            } finally {
                setLoading(false);
            }
        };

        useEffect(() => {
            fetchRanking();
        }, [refreshTrigger]);

        fetchRanking();
    }, []);

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

    if (loading) {
        return (
            <View style={[styles(theme).container, { justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" color={theme.text} />
            </View>
        );
    }

    return (
        <SafeAreaView style={styles(theme).container}>
            {!hasRealData && (
                <Text style={styles(theme).demoText}>
                    Ceci est un classement de démonstration, crée ou rejoins un foyer pour avoir accès à ton classement !
                </Text>
            )}
            <FlatList
                data={ranking}
                keyExtractor={(item) => item.id}
                renderItem={renderItem}
                ItemSeparatorComponent={() => <View style={styles(theme).sep} />}
            />
        </SafeAreaView>
    );
}

const styles = (theme: typeof Colors.light | typeof Colors.dark) =>
    StyleSheet.create({
        container: {
            flex: 1,
            width: '100%',
            backgroundColor: theme.background,
            paddingVertical: Sizes.SPACING_MD,
            paddingHorizontal: Sizes.SPACING_MD,
        },
        row: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingVertical: Sizes.SPACING_MD,
            paddingHorizontal: Sizes.SPACING_MD,
            marginBottom: Sizes.SPACING_SM,
            width: '100%',
        },
        left: {
            flexDirection: 'row',
            alignItems: 'center',
            flex: 1,
        },
        rank: {
            width: Sizes.SPACING_XL,
            textAlign: 'center',
            fontWeight: '700',
            fontSize: Sizes.FONT_SIZE_MD,
            color: theme.muted,
            marginRight: Sizes.SPACING_SM,
        },
        avatar: {
            width: Sizes.AVATAR_SIZE_MD,
            height: Sizes.AVATAR_SIZE_MD,
            borderRadius: Sizes.AVATAR_SIZE_MD / 2,
            marginRight: Sizes.SPACING_SM,
            backgroundColor: theme.avatarBg,
        },
        nameWrap: {
            flex: 1,
            justifyContent: 'center',
        },
        name: {
            fontSize: Sizes.FONT_SIZE_MD,
            fontWeight: '600',
            color: theme.text,
        },
        pointsWrap: {
            alignItems: 'flex-end',
            marginLeft: Sizes.SPACING_MD,
            minWidth: Sizes.SPACING_XXL + Sizes.SPACING_XL,
            paddingRight: Sizes.SPACING_MD,
        },
        points: {
            fontSize: Sizes.FONT_SIZE_MD,
            fontWeight: '700',
            color: theme.text,
        },
        pointsLabel: {
            fontSize: Sizes.FONT_SIZE_SM,
            color: theme.secondary,
        },
        sep: {
            height: StyleSheet.hairlineWidth,
            backgroundColor: theme.separator,
            marginHorizontal: Sizes.SPACING_MD,
        },
        demoText: {
            textAlign: 'center',
            marginBottom: 10,
            color: theme.secondary,
            paddingHorizontal: Sizes.SPACING_MD,
        },
    });
