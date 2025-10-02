import { View, Text, TextInput, TouchableOpacity, StyleSheet, Animated, Modal, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useState, useEffect, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import Sizes from '@/constants/Sizes';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Feather } from '@expo/vector-icons';

const STORAGE_KEY = '@weekly_secret_gift';

export default function SecretGiftComponent() {
    const [gift, setGift] = useState('');
    const [saved, setSaved] = useState(false);
    const [isFocused, setIsFocused] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? "light"];

    const borderAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.timing(borderAnim, {
            toValue: isFocused ? 1 : 0,
            duration: 200,
            useNativeDriver: false,
        }).start();
    }, [borderAnim, isFocused]);

    useEffect(() => {
        const loadGift = async () => {
            try {
                const savedGift = await AsyncStorage.getItem(STORAGE_KEY);
                if (savedGift) setGift(savedGift);
            } catch (e) {
                console.error('Erreur de lecture du cadeau :', e);
            }
        };
        loadGift();
    }, []);

    const handleSaveGift = async () => {
        if (!gift.trim()) return;

        try {
            await AsyncStorage.setItem(STORAGE_KEY, gift);
            setSaved(true);
            setModalVisible(false);
            setTimeout(() => setSaved(false), 2000);
        } catch (e) {
            console.error('Erreur d\'enregistrement du cadeau :', e);
        }
    };

    const borderColor = borderAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [
            'rgba(52, 152, 219, 0.2)',
            'rgba(52, 152, 219, 1)',
        ],
    });

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <TouchableOpacity onPress={() => setModalVisible(true)} style={styles.buttonContainer}>
                <LinearGradient
                    colors={['#f129ba', '#ff758c']}
                    start={{ x: 0, y: 1 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.buttonGradient}
                >
                    <View style={styles.buttonContent}>
                        <Text style={styles.buttonText}>
                            Définir mon cadeau secret de la semaine
                        </Text>
                        <Feather name="gift" size={24} color="#fff" />
                    </View>
                </LinearGradient>
            </TouchableOpacity>

            {saved && <Text style={[styles.savedText, { color: theme.tint }]}>Cadeau enregistré ✔</Text>}

            <Modal
                visible={modalVisible}
                transparent
                animationType="fade"
                onRequestClose={() => setModalVisible(false)}
            >
                <KeyboardAvoidingView
                    style={styles.modalOverlay}
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                >
                    <View style={[styles.modalContent, { backgroundColor: theme.background, borderColor: theme.tint }]}>
                        <Text style={[styles.label, { color: theme.text }]}>
                            Choisissez votre cadeau :
                        </Text>
                        <Animated.View
                            style={[
                                styles.inputWrapper,
                                {
                                    backgroundColor: theme.avatarBg,
                                    borderColor: borderColor,
                                    shadowColor: theme.text,
                                },
                            ]}
                        >
                            <TextInput
                                style={[styles.textarea, { color: theme.text }]}
                                placeholder="Cette semaine, je veux..."
                                placeholderTextColor={theme.secondary}
                                onFocus={() => setIsFocused(true)}
                                onBlur={() => setIsFocused(false)}
                                multiline
                                numberOfLines={4}
                                textAlignVertical="top"
                                value={gift}
                                onChangeText={setGift}
                            />
                        </Animated.View>

                        <View style={styles.modalButtons}>
                            <TouchableOpacity
                                onPress={() => setModalVisible(false)}
                                style={[styles.cancelButton, { borderColor: theme.tint }]}
                            >
                                <Text style={{ color: theme.tint, fontWeight: '600' }}>Annuler</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                onPress={handleSaveGift}
                                style={[styles.validateButton, { backgroundColor: theme.tint }]}
                            >
                                <Text style={{ color: '#fff', fontWeight: '600' }}>Valider</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </KeyboardAvoidingView>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: Sizes.SPACING_MD,
        paddingVertical: Sizes.SPACING_SM,
        marginBottom: Sizes.SPACING_MD,
    },
    mainButton: {
        paddingVertical: Sizes.SPACING_SM,
        borderRadius: Sizes.BUTTON_RADIUS,
        alignItems: 'center',
        justifyContent: 'center',
    },
    mainButtonText: {
        fontSize: Sizes.FONT_SIZE_MD,
        fontWeight: '600',
    },
    savedText: {
        fontSize: Sizes.FONT_SIZE_SM,
        marginVertical: Sizes.SPACING_SM,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: '#00000088',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: Sizes.SPACING_MD,
    },
    modalContent: {
        width: '100%',
        borderRadius: Sizes.INPUT_RADIUS * 1.5,
        borderWidth: 1,
        padding: Sizes.SPACING_MD,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 8,
    },
    label: {
        fontSize: Sizes.FONT_SIZE_MD,
        marginBottom: Sizes.SPACING_SM,
        fontWeight: '600',
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        borderWidth: 1,
        borderRadius: Sizes.INPUT_RADIUS,
        paddingHorizontal: Sizes.SPACING_MD,
        paddingVertical: Sizes.SPACING_SM,
        marginBottom: Sizes.SPACING_SM,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    textarea: {
        flex: 1,
        fontSize: Sizes.FONT_SIZE_MD,
        minHeight: 100,
        paddingVertical: Sizes.SPACING_SM,
    },
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginTop: Sizes.SPACING_MD,
        gap: Sizes.SPACING_SM,
    },
    cancelButton: {
        paddingVertical: Sizes.SPACING_SM,
        paddingHorizontal: Sizes.SPACING_LG,
        borderWidth: 1,
        borderRadius: Sizes.BUTTON_RADIUS,
        alignItems: 'center',
        justifyContent: 'center',
    },
    validateButton: {
        paddingVertical: Sizes.SPACING_SM,
        paddingHorizontal: Sizes.SPACING_LG,
        borderRadius: Sizes.BUTTON_RADIUS,
        alignItems: 'center',
        justifyContent: 'center',
    },
    buttonContainer: {
        width: '100%',
        borderRadius: Sizes.BUTTON_RADIUS,
        overflow: 'hidden',
    },
    buttonGradient: {
        paddingVertical: Sizes.SPACING_LG * 1.5,
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 100,
    },
    buttonText: {
        color: '#fff',
        fontSize: Sizes.FONT_SIZE_LG,
        fontWeight: '600',
        maxWidth: '80%',
        textAlign: 'left',
        lineHeight: Sizes.FONT_SIZE_MD * 1.5,
        flexWrap: 'wrap',
    },
    buttonContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        paddingHorizontal: Sizes.SPACING_MD,
    },
});
