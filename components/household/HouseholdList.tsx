import React, { useEffect, useState } from "react";
import { StyleSheet, View, Text, TouchableOpacity, FlatList, Image } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import Sizes from '@/constants/Sizes';
import { Feather } from '@expo/vector-icons';

const defaultMembers = [
    { id: '1', name: 'Lisaa', role: 'Le Boss', points: 1420, avatar: 'https://api.dicebear.com/7.x/adventurer/png?seed=Lisa' },
    { id: '2', name: 'Tom', role: 'La Fée', points: 1350, avatar: 'https://api.dicebear.com/7.x/adventurer/png?seed=Tom' },
    { id: '3', name: 'Emilie', role: 'La Star', points: 1285, avatar: 'https://api.dicebear.com/7.x/adventurer/png?seed=Emilie' },
    { id: '4', name: 'Tim', role: "L'aventurier", points: 1200, avatar: 'https://api.dicebear.com/7.x/adventurer/png?seed=Tim' },
];

export default function HouseholdList() {
    const [members, setMembers] = useState(defaultMembers);
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? "light"];

    const fetchMembers = async () => {
        try {
            const cached = await AsyncStorage.getItem("members");
            if (cached) {
                setMembers(JSON.parse(cached));
            } else {
                await AsyncStorage.setItem("members", JSON.stringify(defaultMembers));
                setMembers(defaultMembers);
            }
        } catch (e) {
            console.error("Erreur lors du chargement des membres", e);
        }
    };

    useEffect(() => {
        fetchMembers();
    }, []);

    const renderMember = ({ item }) => (
        <View style={styles.memberCard}>
            <View style={styles.avatarPlaceholder}>
                <Image
                    source={{ uri: item.avatar }}
                    style={{ width: 60, height: 60, borderRadius: 30 }}
                />
            </View>

            <Text style={[styles.memberName, { color: theme.text }]}>
                {item.name}
            </Text>

            <Text style={[styles.memberRole, { color: theme.secondary }]}>
                {item.role}
            </Text>

            <View style={styles.pointsBadge}>
                <Feather name="star" size={12} color="#fff" />
                <Text style={styles.pointsText}>{item.points} pts</Text>
            </View>
        </View>
    );

    return (
        <>
            <View style={styles.header}>
                <View style={styles.mainAvatar}>
                    <Text style={{ fontSize: 50 }}>F</Text>
                    <TouchableOpacity style={styles.editButton}>
                        <Feather name="edit-2" size={16} color="#fff" />
                    </TouchableOpacity>
                </View>
                <Text style={styles.householdName}>Nom du foyer</Text>
                <Text style={[styles.membersCount, { color: theme.secondary }]}>
                    {members.length} membres
                </Text>
                <TouchableOpacity style={styles.shareButton}>
                    <Feather name="share-2" size={16} color="#000" />
                    <Text style={styles.shareText}>Partager</Text>
                </TouchableOpacity>
            </View>
            <FlatList
                data={members}
                renderItem={renderMember}
                keyExtractor={(item) => item.id}
                numColumns={2}
                columnWrapperStyle={{ justifyContent: 'space-between' }}
                contentContainerStyle={{
                    paddingVertical: Sizes.SPACING_MD,
                    paddingHorizontal: Sizes.SPACING_MD,
                }}
            />
        </>
    );
}

const styles = StyleSheet.create({
    header: {
        alignItems: 'center',
        marginBottom: Sizes.SPACING_LG,
        marginTop: Sizes.SPACING_MD,
    },
    mainAvatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#eee',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
    },
    editButton: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: '#f39c12',
        borderRadius: 12,
        padding: 6,
    },
    householdName: {
        fontSize: 20,
        fontWeight: '700',
        marginTop: Sizes.SPACING_SM,
    },
    membersCount: {
        marginTop: 4,
        marginBottom: Sizes.SPACING_SM,
    },
    shareButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFD966',
        borderRadius: 20,
        paddingHorizontal: 12,
        paddingVertical: 6,
        gap: 6,
    },
    shareText: {
        fontWeight: '600',
        color: '#000',
    },
    memberCard: {
        width: '48%',
        alignItems: 'center',
        paddingVertical: Sizes.SPACING_MD,
        paddingHorizontal: Sizes.SPACING_SM,
        marginBottom: Sizes.SPACING_MD,
        borderRadius: 16,
        backgroundColor: '#fff',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    avatarPlaceholder: {
        width: 70,
        height: 70,
        borderRadius: 35,
        backgroundColor: '#f0f0f0',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: Sizes.SPACING_SM,
    },
    memberName: {
        fontWeight: '700',
        fontSize: 16,
        marginTop: 4,
    },
    memberRole: {
        fontSize: 12,
        marginTop: 2,
        fontStyle: 'italic',
    },
    pointsBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f39c12',
        borderRadius: 12,
        paddingHorizontal: 8,
        paddingVertical: 2,
        marginTop: 6,
    },
    pointsText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#fff',
        marginLeft: 4,
    },
});
