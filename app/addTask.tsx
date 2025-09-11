import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Pressable,
  Platform,
  useColorScheme,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import Sizes from "@/constants/Sizes";
import { Colors } from "@/constants/Colors";
import ButtonComponent from "@/components/ButtonComponent";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
const API_URL = process.env.EXPO_PUBLIC_API_URL;

function getXpFromDifficulty(
  difficulty: "facile" | "moyen" | "difficile"
): number {
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

const AddTaskScreen = () => {
  const [type, setType] = useState<"recurring" | "one-shot">("one-shot");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [recurringDays, setRecurringDays] = useState("");
  const [difficulty, setDifficulty] = useState<
    "facile" | "moyen" | "difficile"
  >("moyen");

  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? "light"];
  const themedStyles = getThemedStyles(theme);

  async function handleSaveTask() {
    const newTask = {
      repetition: type === "recurring" ? Number(recurringDays) || 1 : 1,
      deactivated: false,
      xp: getXpFromDifficulty(difficulty),
      dueDateStatus: "late",
      titre: name,
      dueDate: dueDate ? dueDate.toISOString().split("T")[0] : undefined,
      done: false,
    };
    try {
      const cached = await AsyncStorage.getItem("tasks");
      let tasks = [];
      if (cached) {
        tasks = JSON.parse(cached);
      }

      tasks.push(newTask);
      await AsyncStorage.setItem("tasks", JSON.stringify(tasks));
      router.push("/");
    } catch (e) {
      console.error("Erreur lors de la sauvegarde de la tâche", e);
    }
  }

  return (
    <View style={themedStyles.container}>
      <View style={themedStyles.typeRow}>
        <Pressable
          style={[
            themedStyles.typeButton,
            type === "recurring" && themedStyles.typeButtonActive,
          ]}
          onPress={() => setType("recurring")}
        >
          <Text
            style={[
              themedStyles.typeText,
              type === "recurring" && themedStyles.typeTextActive,
            ]}
          >
            Récurrente
          </Text>
        </Pressable>
        <Pressable
          style={[
            themedStyles.typeButton,
            type === "one-shot" && themedStyles.typeButtonActive,
          ]}
          onPress={() => setType("one-shot")}
        >
          <Text
            style={[
              themedStyles.typeText,
              type === "one-shot" && themedStyles.typeTextActive,
            ]}
          >
            Ponctuelle
          </Text>
        </Pressable>
      </View>
      {type === "recurring" && (
        <>
          <Text style={themedStyles.label}>À quelle fréquence ?</Text>
          <View style={themedStyles.inputRow}>
            <TextInput
              style={[themedStyles.input, { flex: 1 }]}
              placeholder="Ex: 7"
              keyboardType="numeric"
              value={recurringDays}
              onChangeText={setRecurringDays}
              placeholderTextColor={theme.secondary}
            />
            <Text
              style={{
                marginLeft: Sizes.SPACING_XS,
                alignSelf: "center",
                color: theme.secondary,
              }}
            >
              jours
            </Text>
          </View>
        </>
      )}
      {type === "one-shot" && (
        <>
          <Text style={themedStyles.label}>Date d'échéance</Text>
          <View style={themedStyles.inputRow}>
            <TouchableOpacity
              style={[
                themedStyles.input,
                { flex: 1, justifyContent: "center" },
              ]}
              onPress={() => setShowDatePicker(true)}
            >
              <Text
                style={{
                  color: dueDate ? theme.text : theme.secondary,
                }}
              >
                {dueDate
                  ? dueDate.toLocaleDateString("fr-FR", {
                      year: "numeric",
                      month: "2-digit",
                      day: "2-digit",
                    })
                  : "Choisir une date"}
              </Text>
            </TouchableOpacity>
            {showDatePicker && (
              <DateTimePicker
                value={dueDate || new Date()}
                mode="date"
                display={Platform.OS === "ios" ? "spinner" : "default"}
                locale="fr-FR"
                onChange={(event, selectedDate) => {
                  setShowDatePicker(Platform.OS === "ios");
                  if (selectedDate) setDueDate(selectedDate);
                }}
                minimumDate={new Date(2000, 0, 1)}
                maximumDate={new Date(2100, 11, 31)}
              />
            )}
          </View>
        </>
      )}
      <Text style={themedStyles.label}>Difficulté</Text>
      <View style={themedStyles.inputRow}>
        <TouchableOpacity
          style={[
            themedStyles.input,
            {
              flex: 1,
              backgroundColor:
                difficulty === "facile" ? theme.tint : theme.avatarBg,
            },
          ]}
          onPress={() => setDifficulty("facile")}
        >
          <Text
            style={{
              color: difficulty === "facile" ? theme.background : theme.text,
              textAlign: "center",
            }}
          >
            Facile
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            themedStyles.input,
            {
              flex: 1,
              backgroundColor:
                difficulty === "moyen" ? theme.tint : theme.avatarBg,
            },
          ]}
          onPress={() => setDifficulty("moyen")}
        >
          <Text
            style={{
              color: difficulty === "moyen" ? theme.background : theme.text,
              textAlign: "center",
            }}
          >
            Moyen
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            themedStyles.input,
            {
              flex: 1,
              backgroundColor:
                difficulty === "difficile" ? theme.tint : theme.avatarBg,
            },
          ]}
          onPress={() => setDifficulty("difficile")}
        >
          <Text
            style={{
              color: difficulty === "difficile" ? theme.background : theme.text,
              textAlign: "center",
            }}
          >
            Difficile
          </Text>
        </TouchableOpacity>
      </View>
      <Text style={themedStyles.label}>Nom de la tâche</Text>
      <TextInput
        style={themedStyles.input}
        placeholder="Ex: Sortir les poubelles"
        value={name}
        onChangeText={setName}
        placeholderTextColor={theme.secondary}
      />
      <Text style={themedStyles.label}>Description</Text>
      <TextInput
        style={[themedStyles.input, themedStyles.textarea]}
        placeholder="Ajouter des détails sur la tâche..."
        value={description}
        onChangeText={setDescription}
        multiline
        numberOfLines={3}
        placeholderTextColor={theme.secondary}
      />

      <ButtonComponent
        type="primary"
        titre="Ajouter la Tâche"
        action={handleSaveTask}
        style={themedStyles.saveButton}
      />
    </View>
  );
};

function getThemedStyles(theme: typeof Colors.light) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
      borderTopLeftRadius: Sizes.CARD_RADIUS_LG,
      borderTopRightRadius: Sizes.CARD_RADIUS_LG,
      padding: Sizes.SPACING_LG,
      paddingTop: Sizes.SPACING_LG,
    },
    typeRow: {
      flexDirection: "row",
      justifyContent: "center",
      marginBottom: Sizes.SPACING_MD,
      gap: Sizes.SPACING_SM,
    },
    typeButton: {
      borderWidth: 1,
      borderColor: theme.separator,
      borderRadius: Sizes.BUTTON_RADIUS,
      paddingVertical: Sizes.SPACING_XS,
      paddingHorizontal: Sizes.SPACING_MD,
      backgroundColor: theme.avatarBg,
    },
    typeButtonActive: {
      backgroundColor: theme.background,
      borderColor: theme.tint,
    },
    typeText: {
      color: theme.secondary,
      fontWeight: "600",
      fontSize: Sizes.FONT_SIZE_MD,
    },
    typeTextActive: {
      color: theme.tint,
    },
    label: {
      fontWeight: "600",
      marginTop: Sizes.SPACING_MD,
      marginBottom: Sizes.SPACING_XS,
      color: theme.text,
      fontSize: Sizes.FONT_SIZE_SM,
    },
    input: {
      borderWidth: 1,
      borderColor: theme.separator,
      borderRadius: Sizes.INPUT_RADIUS,
      padding: Sizes.SPACING_MD,
      backgroundColor: theme.avatarBg,
      marginBottom: Sizes.SPACING_SM,
      fontSize: Sizes.FONT_SIZE_MD,
      color: theme.text,
    },
    textarea: {
      minHeight: Sizes.SPACING_XL + Sizes.SPACING_MD,
      textAlignVertical: "top",
    },
    inputRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: Sizes.SPACING_XS,
      marginBottom: Sizes.SPACING_SM,
    },
    saveButton: {
      marginTop: Sizes.SPACING_XL,
      borderRadius: Sizes.BUTTON_RADIUS,
      backgroundColor: theme.tint,
      alignSelf: "center",
      width: "100%",
    },
  });
}

export default AddTaskScreen;
