import React, { useEffect, useMemo, useState } from "react";
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Pressable, Platform, useColorScheme, Alert } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import Sizes from "@/constants/Sizes";
import { Colors } from "@/constants/Colors";
import ButtonComponent from "@/components/ButtonComponent";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router, useLocalSearchParams } from "expo-router";

function getXpFromDifficulty(difficulty: "facile" | "moyen" | "difficile"): number {
  switch (difficulty) {
    case "facile":
      return 10;
    case "moyen":
      return 50;
    case "difficile":
      return 100;
    default:
      return 10;
  }
}

export default function EditTaskScreen() {
  const params = useLocalSearchParams<{ id?: string }>();
  const editingId = useMemo(() => (params?.id ? Number(params.id) : null), [params]);

  const [type, setType] = useState<"recurring" | "one-shot">("one-shot");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [recurringDays, setRecurringDays] = useState("");
  const [difficulty, setDifficulty] = useState<"facile" | "moyen" | "difficile">("moyen");

  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? "light"];
  const styles = getStyles(theme);

  useEffect(() => {
    (async () => {
      if (editingId != null && !Number.isNaN(editingId)) {
        try {
          const raw = await AsyncStorage.getItem("tasks");
          if (raw) {
            const list = JSON.parse(raw);
            const existing = list.find((t: any) => t.id === editingId);
            if (existing) {
              setName(existing.titre ?? "");
              setDescription(existing.description ?? "");
              setDifficulty(existing.xp >= 100 ? "difficile" : existing.xp >= 50 ? "moyen" : "facile");
              if (existing.dueDate) setDueDate(new Date(existing.dueDate));
              setType(existing.repetition && existing.repetition > 1 ? "recurring" : "one-shot");
              if (existing.repetition && existing.repetition > 1) setRecurringDays(String(existing.repetition));
            }
          }
        } catch {}
      }
    })();
  }, [editingId]);

  async function save() {
    if (editingId == null || Number.isNaN(editingId)) return;
    const base = {
      repetition: type === "recurring" ? Number(recurringDays) || 1 : 1,
      xp: getXpFromDifficulty(difficulty),
      titre: name,
      description,
      dueDate: dueDate ? dueDate.toISOString().split("T")[0] : undefined,
    };
    try {
      const raw = await AsyncStorage.getItem("tasks");
      if (!raw) return;
      const list = JSON.parse(raw);
      const next = list.map((t: any) => (t.id === editingId ? { ...t, ...base, id: editingId } : t));
      await AsyncStorage.setItem("tasks", JSON.stringify(next));
      router.replace("/");
    } catch (e) {
      console.error("Erreur lors de la mise à jour", e);
    }
  }

  async function remove() {
    if (editingId == null || Number.isNaN(editingId)) return;
    const confirm = true;
    try {
      const raw = await AsyncStorage.getItem("tasks");
      if (!raw) return;
      const list = JSON.parse(raw).filter((t: any) => t.id !== editingId);
      await AsyncStorage.setItem("tasks", JSON.stringify(list));
      router.replace("/");
    } catch (e) {
      console.error("Erreur lors de la suppression", e);
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.typeRow}>
        <Pressable style={[styles.typeButton, type === "recurring" && styles.typeButtonActive]} onPress={() => setType("recurring")}>
          <Text style={[styles.typeText, type === "recurring" && styles.typeTextActive]}>Récurrente</Text>
        </Pressable>
        <Pressable style={[styles.typeButton, type === "one-shot" && styles.typeButtonActive]} onPress={() => setType("one-shot")}>
          <Text style={[styles.typeText, type === "one-shot" && styles.typeTextActive]}>Ponctuelle</Text>
        </Pressable>
      </View>

      {type === "recurring" && (
        <>
          <Text style={styles.label}>À quelle fréquence ?</Text>
          <View style={styles.inputRow}>
            <TextInput style={[styles.input, { flex: 1 }]} placeholder="Ex: 7" keyboardType="numeric" value={recurringDays} onChangeText={setRecurringDays} placeholderTextColor={theme.secondary} />
            <Text style={{ marginLeft: Sizes.SPACING_XS, alignSelf: "center", color: theme.secondary }}>jours</Text>
          </View>
        </>
      )}

      {type === "one-shot" && (
        <>
          <Text style={styles.label}>Date d’échéance</Text>
          <View style={styles.inputRow}>
            <TouchableOpacity style={[styles.input, { flex: 1, justifyContent: "center" }]} onPress={() => setShowDatePicker(true)}>
              <Text style={{ color: dueDate ? theme.text : theme.secondary }}>
                {dueDate ? dueDate.toLocaleDateString("fr-FR", { year: "numeric", month: "2-digit", day: "2-digit" }) : "Choisir une date"}
              </Text>
            </TouchableOpacity>
            {showDatePicker && (
              <DateTimePicker
                value={dueDate || new Date()}
                mode="date"
                display={Platform.OS === "ios" ? "spinner" : "default"}
                locale="fr-FR"
                onChange={(event, selected) => {
                  setShowDatePicker(Platform.OS === "ios");
                  if (selected) setDueDate(selected);
                }}
                minimumDate={new Date(2000, 0, 1)}
                maximumDate={new Date(2100, 11, 31)}
              />
            )}
          </View>
        </>
      )}

      <Text style={styles.label}>Difficulté</Text>
      <View style={styles.inputRow}>
        <TouchableOpacity style={[styles.input, { flex: 1, backgroundColor: difficulty === "facile" ? theme.tint : theme.avatarBg }]} onPress={() => setDifficulty("facile")}>
          <Text style={{ color: difficulty === "facile" ? theme.background : theme.text, textAlign: "center" }}>Facile</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.input, { flex: 1, backgroundColor: difficulty === "moyen" ? theme.tint : theme.avatarBg }]} onPress={() => setDifficulty("moyen")}>
          <Text style={{ color: difficulty === "moyen" ? theme.background : theme.text, textAlign: "center" }}>Moyen</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.input, { flex: 1, backgroundColor: difficulty === "difficile" ? theme.tint : theme.avatarBg }]} onPress={() => setDifficulty("difficile")}>
          <Text style={{ color: difficulty === "difficile" ? theme.background : theme.text, textAlign: "center" }}>Difficile</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.label}>Nom de la tâche</Text>
      <TextInput style={styles.input} placeholder="Ex: Sortir les poubelles" value={name} onChangeText={setName} placeholderTextColor={theme.secondary} />

      <Text style={styles.label}>Description</Text>
      <TextInput style={[styles.input, styles.textarea]} placeholder="Ajouter des détails sur la tâche..." value={description} onChangeText={setDescription} multiline numberOfLines={3} placeholderTextColor={theme.secondary} />

      <ButtonComponent type="primary" titre="Enregistrer" action={save} style={styles.saveButton} />
      <ButtonComponent type="secondary" titre="Supprimer la Tâche" action={remove} style={styles.saveButton} />
    </View>
  );
}

function getStyles(theme: typeof Colors.light) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.background, borderTopLeftRadius: Sizes.CARD_RADIUS_LG, borderTopRightRadius: Sizes.CARD_RADIUS_LG, padding: Sizes.SPACING_LG, paddingTop: Sizes.SPACING_LG },
    typeRow: { flexDirection: "row", justifyContent: "center", marginBottom: Sizes.SPACING_MD, gap: Sizes.SPACING_SM },
    typeButton: { borderWidth: 1, borderColor: theme.separator, borderRadius: Sizes.BUTTON_RADIUS, paddingVertical: Sizes.SPACING_XS, paddingHorizontal: Sizes.SPACING_MD, backgroundColor: theme.avatarBg },
    typeButtonActive: { backgroundColor: theme.background, borderColor: theme.tint },
    typeText: { color: theme.secondary, fontWeight: "600", fontSize: Sizes.FONT_SIZE_MD },
    typeTextActive: { color: theme.tint },
    label: { fontWeight: "600", marginTop: Sizes.SPACING_MD, marginBottom: Sizes.SPACING_XS, color: theme.text, fontSize: Sizes.FONT_SIZE_SM },
    input: { borderWidth: 1, borderColor: theme.separator, borderRadius: Sizes.INPUT_RADIUS, padding: Sizes.SPACING_MD, backgroundColor: theme.avatarBg, marginBottom: Sizes.SPACING_SM, fontSize: Sizes.FONT_SIZE_MD, color: theme.text },
    textarea: { minHeight: Sizes.SPACING_XL + Sizes.SPACING_MD, textAlignVertical: "top" },
    inputRow: { flexDirection: "row", alignItems: "center", gap: Sizes.SPACING_XS, marginBottom: Sizes.SPACING_SM },
    saveButton: { marginTop: Sizes.SPACING_XL, borderRadius: Sizes.BUTTON_RADIUS, backgroundColor: theme.tint, alignSelf: "center", width: "100%" },
  });
}

