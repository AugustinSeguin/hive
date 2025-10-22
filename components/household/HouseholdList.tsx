import React, { useEffect, useState } from "react";
import { StyleSheet, View, Text, TouchableOpacity, FlatList, Image, Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import Sizes from '@/constants/Sizes';
import { Feather } from '@expo/vector-icons';
import EditHouseholdModal from "@/components/household/EditHousehold";
import JoinHouseholdModal from "@/components/household/JoinHousehold";
import { useRouter } from "expo-router";

const defaultMembers = [
    { id: '1', name: 'Lisaa', role: 'Le Boss', points: 1420, avatar: 'https://api.dicebear.com/7.x/adventurer/png?seed=Lisa' },
    { id: '2', name: 'Tom', role: 'La Fée', points: 1350, avatar: 'https://api.dicebear.com/7.x/adventurer/png?seed=Tom' },
    { id: '3', name: 'Emilie', role: 'La Star', points: 1285, avatar: 'https://api.dicebear.com/7.x/adventurer/png?seed=Emilie' },
    { id: '4', name: 'Tim', role: "L'aventurier", points: 1200, avatar: 'https://api.dicebear.com/7.x/adventurer/png?seed=Tim' },
];

export default function HouseholdList() {
    const apiUrl = process.env.EXPO_PUBLIC_API_URL;
    const [members, setMembers] = useState(defaultMembers);
    const [householdId, setHouseholdId] = useState(null);
    const [householdName, setHouseholdName] = useState(null);
    const [avatarUri, setAvatarUri] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [joinModalVisible, setJoinModalVisible] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const router = useRouter();

    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? "light"];

    const fetchData = async () => {
        try {
            const token = await AsyncStorage.getItem("userToken");

            if (!token) {
                setIsLoggedIn(false);
                setMembers(defaultMembers);
                setHouseholdId(null);
                setHouseholdName(null);
                setAvatarUri(null);
                return;
            }

            setIsLoggedIn(true);
            const storedId = await AsyncStorage.getItem("householdId");

            if (storedId) {
                setHouseholdId(storedId);

                const res = await fetch(`${apiUrl}/households/${storedId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                if (res.ok) {
                    const data = await res.json();
                    setHouseholdName(data.name);
                    setAvatarUri(data.avatarUrl);

                    await AsyncStorage.setItem("householdName", data.name);
                    if (data.avatarUrl) await AsyncStorage.setItem("householdAvatar", data.avatarUrl);

                    const formattedMembers = data.members.map((m) => ({
                        id: m.id.toString(),
                        name: m.pseudo,
                        role: m.id === data.ownerId ? "Propriétaire" : "Membre",
                        points: 0,
                        avatar: m.avatarUrl || `https://api.dicebear.com/7.x/adventurer/png?seed=${m.pseudo}`,
                    }));

                    setMembers(formattedMembers);
                    await AsyncStorage.setItem("members", JSON.stringify(formattedMembers));
                }
            } else {
                setMembers(defaultMembers);
                setHouseholdName(null);
                setAvatarUri(null);
            }
        } catch (e) {
            console.error("Erreur lors du chargement des données", e);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleSaveHousehold = async ({ name, avatar }) => {
        try {
            const token = await AsyncStorage.getItem("userToken");
            if (!token) return;

            if (!householdId) {
                // Création du foyer
                const res = await fetch(`${apiUrl}/households`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({ name, avatarUrl: avatar || "" }),
                });

                if (!res.ok) {
                    console.error("Erreur création foyer");
                    Alert.alert("Erreur", "Impossible de créer le foyer. Veuillez réessayer plus tard.");
                    return;
                }

                const data = await res.json();
                setHouseholdId(data.id.toString());
                await AsyncStorage.setItem("householdId", data.id.toString());

                Alert.alert("Succès", "Le foyer a bien été créé.");
            } else {
                // Édition du foyer
                const res = await fetch(`${apiUrl}/households/${householdId}`, {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({ name, avatarUrl: avatar || "" }),
                });

                if (!res.ok) {
                    console.error("Erreur édition foyer");
                    Alert.alert("Erreur", "Impossible de modifier le foyer. Veuillez réessayer plus tard.");
                    return;
                }

                Alert.alert("Succès", "Le foyer a bien été mis à jour");
            }

            setHouseholdName(name);
            setAvatarUri(avatar);
            await AsyncStorage.setItem("householdName", name);
            if (avatar) await AsyncStorage.setItem("householdAvatar", avatar);

            fetchData();
        } catch (e) {
            console.error("Erreur lors de la sauvegarde/création du foyer", e);
        }
    };

    const handleLeaveHousehold = async () => {
        try {
            const token = await AsyncStorage.getItem("userToken");
            if (!token) {
                Alert.alert("Erreur", "Vous devez être connecté pour quitter un foyer.");
                return;
            }

            const res = await fetch(`${apiUrl}/households/${householdId}/leave`, {
                method: "POST",
                headers: { Authorization: `Bearer ${token}` },
            });

            if (!res.ok) {
                console.error("Erreur quitter foyer");
                Alert.alert("Erreur", "Impossible de quitter le foyer. Veuillez réessayer plus tard.");
                return;
            }

            // Suppression locale des données du foyer
            await AsyncStorage.multiRemove(["householdId", "householdName", "householdAvatar", "members"]);
            setHouseholdId(null);
            setHouseholdName(null);
            setAvatarUri(null);
            setMembers(defaultMembers);

            Alert.alert("Succès", "Vous avez quitté le foyer.");
        } catch (e) {
            console.error("Erreur quitter foyer", e);
            Alert.alert("Erreur", "Une erreur est survenue. Veuillez réessayer plus tard.");
        }
    };

    const handleJoinHousehold = async (id) => {
        try {
            const token = await AsyncStorage.getItem("userToken");
            if (!token) {
                Alert.alert("Erreur", "Vous devez être connecté pour rejoindre un foyer.");
                return;
            }

            const res = await fetch(`${apiUrl}/households/${id}/join`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!res.ok) {
                console.error("Erreur rejoindre foyer");
                Alert.alert("Erreur", "Impossible de rejoindre le foyer. Veuillez vérifier l'ID ou réessayer plus tard.");
                return;
            }

            await AsyncStorage.setItem("householdId", id.toString());
            setHouseholdId(id.toString());

            setJoinModalVisible(false);
            await fetchData();

            Alert.alert("Succès", "Vous avez rejoint le foyer !");
        } catch (e) {
            console.error("Erreur rejoindre foyer", e);
            Alert.alert("Erreur", "Une erreur est survenue. Veuillez réessayer plus tard.");
        }
    };

    const renderMember = ({ item }) => (
        <View style={styles.memberCard}>
            <View style={styles.avatarPlaceholder}>
                <Image source={{ uri: item.avatar }} style={{ width: 60, height: 60, borderRadius: 30 }} />
                {item.role === "Propriétaire" && (
                    <View style={styles.ownerBadge}>
                        <Feather name="award" size={14} color="#FFD700" />
                    </View>
                )}
            </View>
            <Text style={[styles.memberName, { color: theme.text }]}>{item.name}</Text>
            <Text style={[styles.memberRole, { color: theme.secondary }]}>{item.role}</Text>
            <View style={styles.pointsBadge}>
                <Feather name="star" size={12} color="#fff" />
                <Text style={styles.pointsText}>{item.points} pts</Text>
            </View>
        </View>
    );

    return (
        <>
            <View style={styles.header}>
                {!isLoggedIn ? (
                    <>
                        <Text style={styles.noHouseholdTitle}>Bienvenue !</Text>
                        <Text style={styles.noHouseholdText}>
                            Connecte-toi ou crée un compte pour créer ou rejoindre un foyer.
                        </Text>
                        <View style={{ flexDirection: 'row', gap: 10 }}>
                            <TouchableOpacity
                                style={styles.createButton}
                                onPress={() => router.push("/login")}
                            >
                                <Feather name="log-in" size={18} color="#fff" />
                                <Text style={styles.createButtonText}>Se connecter</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.createButton, { backgroundColor: '#2980b9' }]}
                                onPress={() => router.push("/register")}
                            >
                                <Feather name="user-plus" size={18} color="#fff" />
                                <Text style={styles.createButtonText}>S'inscrire</Text>
                            </TouchableOpacity>
                        </View>
                    </>
                ) : householdId ? (
                    <>
                        <View style={styles.mainAvatar}>
                            {avatarUri ? (
                                <Image source={{ uri: avatarUri }} style={{ width: 100, height: 100, borderRadius: 50 }} />
                            ) : (
                                <Text style={{ fontSize: 50 }}>F</Text>
                            )}
                            <TouchableOpacity style={styles.editButton} onPress={() => setModalVisible(true)}>
                                <Feather name="edit-2" size={16} color="#fff" />
                            </TouchableOpacity>
                        </View>
                        <Text style={styles.householdName}>{householdName || "Nom du foyer"}</Text>
                        <Text style={[styles.membersCount, { color: theme.secondary }]}>{members.length} membres</Text>
                        <View style={{ flexDirection: 'row', gap: 10 }}>
                            <TouchableOpacity style={styles.shareButton}>
                                <Feather name="share-2" size={16} color="#000" />
                                <Text style={styles.shareText}>Partager</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.createButton, { backgroundColor: "#e74c3c" }]}
                                onPress={handleLeaveHousehold}
                            >
                                <Feather name="log-out" size={16} color="#fff" />
                                <Text style={styles.createButtonText}>Quitter le foyer</Text>
                            </TouchableOpacity>
                        </View>
                    </>
                ) : (
                    <>
                        <Text style={styles.noHouseholdTitle}>Aucun foyer trouvé</Text>
                        <Text style={styles.noHouseholdText}>
                            Crée ton premier foyer pour commencer à gérer tes membres 🎉
                        </Text>
                        <View style={{ flexDirection: 'row', gap: 10 }}>
                            <TouchableOpacity style={styles.createButton} onPress={() => setModalVisible(true)}>
                                <Feather name="plus-circle" size={18} color="#fff" />
                                <Text style={styles.createButtonText}>Créer un foyer</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.createButton, { backgroundColor: '#2980b9' }]} onPress={() => setJoinModalVisible(true)}>
                                <Feather name="log-in" size={18} color="#fff" />
                                <Text style={styles.createButtonText}>Rejoindre un foyer</Text>
                            </TouchableOpacity>
                        </View>
                    </>
                )}
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

            <EditHouseholdModal
                visible={modalVisible}
                onClose={() => setModalVisible(false)}
                initialName={householdName || ""}
                initialAvatar={avatarUri}
                onSave={handleSaveHousehold}
            />

            <JoinHouseholdModal
                visible={joinModalVisible}
                onClose={() => setJoinModalVisible(false)}
                onJoin={handleJoinHousehold}
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
        zIndex: 1,
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
    noHouseholdTitle: {
        fontSize: 22,
        fontWeight: '700',
        marginBottom: 8,
        color: "#444",
    },
    noHouseholdText: {
        fontSize: 14,
        marginBottom: 12,
        color: "#666",
        textAlign: "center",
        paddingHorizontal: 20,
    },
    createButton: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#27ae60",
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        gap: 8,
    },
    createButtonText: {
        color: "#fff",
        fontWeight: "600",
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
    ownerBadge: {
        position: "absolute",
        bottom: -2,
        right: -2,
        backgroundColor: "#fff",
        borderRadius: 10,
        padding: 2,
        borderWidth: 1,
        borderColor: "#FFD700",
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
