import React from "react";
import {
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useColorScheme,
} from "react-native";

import { Colors } from "../constants/Colors";
import Sizes from "../constants/Sizes";

import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
const API_URL = process.env.EXPO_PUBLIC_API_URL;

export type TaskProps = {
  id?: number | undefined;
  dueDateStatus: "late" | "soon" | "currentWeek" | "later" | undefined;
  action: () => void;
  onLongPress?: () => void;
  titre: string;
  dueDate: string | undefined;
  deactivated?: boolean;
  repetition?: number | undefined;
  deactivated?: boolean;
  xp?: number | undefined;
};

function getBorderColor(
  dueDateStatus: "late" | "soon" | "currentWeek" | "later" | undefined,
  colorScheme: "light" | "dark" | null | undefined
) {
  switch (dueDateStatus) {
    case "late":
      return Colors[colorScheme ?? "light"].lateTask;
    case "soon":
      return Colors[colorScheme ?? "light"].soonTask;
    case "currentWeek":
      return Colors[colorScheme ?? "light"].currentWeekTask;
    case "later":
    default:
      return Colors[colorScheme ?? "light"].laterTask;
  }
}

function getDueDateText(dueDateStr?: string): string | null {
  if (!dueDateStr) return null;
  const today = new Date().setHours(0, 0, 0, 0);
  const dueDate = new Date(dueDateStr).setHours(0, 0, 0, 0);
  const diffTime = dueDate - today;
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
  if (diffDays <= 0) {
    return "Aujourd'hui";
  }
  if (diffDays === 1) {
    return "Demain";
  }
  if (diffDays > 1) {
    return `Dans ${diffDays} jours`;
  }
  return null;
}

function getStyles(colorScheme: "light" | "dark") {
  const theme = Colors[colorScheme];
  return StyleSheet.create({
    card: {
      backgroundColor: theme.background,
      borderRadius: Sizes.CARD_RADIUS_XS,
      borderLeftWidth: 8,
      padding: Sizes.SPACING_MD,
      marginVertical: Sizes.SPACING_XS,
      shadowColor: colorScheme === "dark" ? theme.text : "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 4,
      elevation: 2,
      marginHorizontal: Sizes.SPACING_LG,
    },
    content: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    textContainer: {
      flex: 1,
      minWidth: 0,
    },
    title: {
      fontWeight: "bold",
      fontSize: Sizes.FONT_SIZE_MD,
      color: theme.text,
      marginBottom: Sizes.SPACING_XXS,
    },
    subtitle: {
      color: theme.icon,
      fontSize: Sizes.FONT_SIZE_SM,
    },
    checkContainer: {
      marginLeft: Sizes.SPACING_MD,
      justifyContent: "center",
      alignItems: "center",
    },
    checkCircle: {
      width: Sizes.ICON_SIZE_LG,
      height: Sizes.ICON_SIZE_LG,
      borderRadius: Sizes.ICON_SIZE_LG / 2,
      borderWidth: 2,
      borderColor: theme.icon,
      backgroundColor: theme.background,
      justifyContent: "center",
      alignItems: "center",
    },
    checkCircleDeactivated: {
      borderColor: theme.tint,
      backgroundColor: theme.background,
    },
  });
}

const TaskComponent: React.FC<TaskProps> = React.memo(
  ({ action, onLongPress, titre, dueDate, dueDateStatus, deactivated, xp }) => {
    const colorScheme = useColorScheme() ?? "light";
    const styles = getStyles(colorScheme);
    const borderColor = getBorderColor(dueDateStatus, colorScheme);
    const dueDateText = getDueDateText(dueDate);

    return (
      <TouchableOpacity
        onPress={action}
        onLongPress={onLongPress}
        style={[
          styles.card,
          { borderLeftColor: borderColor },
          deactivated && { opacity: 0.5 },
        ]}
        activeOpacity={0.8}
      >
        <View style={styles.content}>
          <View style={styles.textContainer}>
            <Text style={styles.title}>{titre}</Text>
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 8 }}
            >
              {dueDateText && (
                <Text style={styles.subtitle}>{dueDateText}</Text>
              )}
              <View
                style={{
                  borderWidth: 1,
                  borderColor: Colors[colorScheme].tint,
                  borderRadius: 8,
                  paddingHorizontal: 8,
                  paddingVertical: 2,
                  marginLeft: 8,
                  alignSelf: "flex-start",
                  backgroundColor:
                    colorScheme === "dark" ? Colors.dark.background : "#fff",
                }}
              >
                <Text
                  style={{
                    color: Colors[colorScheme].tint,
                    fontWeight: "bold",
                    fontSize: 12,
                  }}
                >
                  {xp} xp
                </Text>
              </View>
            </View>
          </View>
          <View style={styles.checkContainer}>
            <View
              style={[
                styles.checkCircle,
                deactivated && styles.checkCircleDeactivated,
              ]}
            >
              {deactivated && (
                <Ionicons
                  name="checkmark"
                  size={20}
                  color={Colors[colorScheme].tint}
                />
              )}
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  },
  (prevProps, nextProps) =>
    prevProps.deactivated === nextProps.deactivated &&
    prevProps.xp === nextProps.xp &&
    prevProps.titre === nextProps.titre &&
    prevProps.dueDate === nextProps.dueDate
);

export type ApiTaskJson = {
  id: number;
  title: string;
  repetition: number | null;
  dueDate: string | null;
  deactivated: boolean;
  xp: number;
  deactivated?: boolean;
};

function calculateDueDateStatus(
  dueDateStr: string | null | undefined
): TaskProps["dueDateStatus"] {
  if (!dueDateStr) return undefined;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const dueDate = new Date(dueDateStr);
  dueDate.setHours(0, 0, 0, 0);

  if (dueDate.getTime() < today.getTime()) {
    return "late";
  }

  const currentDayOfWeek = today.getDay();
  const daysUntilSunday = currentDayOfWeek === 0 ? 0 : 7 - currentDayOfWeek;

  const nextWeekStart = new Date(today);
  nextWeekStart.setDate(today.getDate() + daysUntilSunday + 1);

  if (dueDate.getTime() < nextWeekStart.getTime()) {
    return "currentWeek";
  }

  const diffTime = Math.abs(dueDate.getTime() - today.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays <= 7) {
    return "soon";
  }

  return "later";
}

export function mapApiTaskToTaskProps(apiTask: ApiTaskJson): TaskProps {
  const repetition =
    apiTask.repetition !== null ? apiTask.repetition : undefined;
  const dueDate = apiTask.dueDate || undefined;

  const status = calculateDueDateStatus(dueDate);

  return {
    id: apiTask.id,
    titre: apiTask.title,

    action: () => console.log(`task deactivated: ${apiTask.title}`),

    dueDate: dueDate,
    dueDateStatus: status,

    deactivated: apiTask.deactivated,
    repetition: repetition,
    deactivated: apiTask.deactivated,
    xp: apiTask.xp,
  };
}

export async function completeTask(
  taskId: number,
  xpEarned: number,
  userId: number
): Promise<boolean> {
  if (!API_URL) {
    Alert.alert(
      "Erreur de configuration",
      "L'URL de l'API n'est pas définie (EXPO_PUBLIC_API_URL)."
    );
    return false;
  }

  try {
    const token = await AsyncStorage.getItem("userToken");

    if (!token) {
      Alert.alert(
        "Erreur d'authentification",
        "Token non trouvé. Veuillez vous reconnecter."
      );
      return false;
    }

    const apiPayload = {
      xpEarned: xpEarned,
      taskId: taskId,
      userId: userId,
    };

    const response = await fetch(`${API_URL}/tasks/${taskId}/complete`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(apiPayload),
    });

    if (!response.ok) {
      const errorData = await response
        .json()
        .catch(() => ({ message: "Erreur inconnue." }));

      Alert.alert(
        "Échec de la complétion",
        errorData.message ||
          `Erreur serveur: ${response.status} (${response.statusText})`
      );
      return false;
    }

    const responseData = await response.json();
    const updatedTask = await mapApiTaskToTaskProps(responseData);

    const cached = await AsyncStorage.getItem("tasks");
    let tasks: TaskProps[] = [];
    if (cached) {
      const taskJson = JSON.parse(cached);
      tasks = taskJson.map((t: any) => mapApiTaskToTaskProps(t));
    }
    tasks = tasks.map((t) => (t.id === updatedTask.id ? updatedTask : t));
    await AsyncStorage.setItem("tasks", JSON.stringify(tasks));

    return true;
  } catch (error) {
    console.error("Erreur lors de l'appel API pour compléter la tâche:", error);
    Alert.alert("Erreur de connexion", "Impossible de contacter le serveur.");
    return false;
  }
}

export default TaskComponent;
