import React from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useColorScheme,
} from "react-native";

import { Colors } from "../constants/Colors";
import Sizes from "../constants/Sizes";

import { Ionicons } from "@expo/vector-icons";

export type TaskProps = {
  id?: number | undefined;
  dueDateStatus: "late" | "soon" | "currentWeek" | "later" | undefined;
  action: () => void;
  titre: string;
  dueDate: string | undefined;
  done?: boolean;
  repetition?: number | undefined;
  deactivated?: boolean;
  xp?: number | undefined;
};

// title, repetition, dueDate, deactivated, xp,

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
    checkCircleDone: {
      borderColor: theme.tint,
      backgroundColor: theme.background,
    },
  });
}

const TaskComponent: React.FC<TaskProps> = React.memo(
  ({ action, titre, dueDate, dueDateStatus, done, xp }) => {
    const colorScheme = useColorScheme() ?? "light";
    const styles = getStyles(colorScheme);
    const borderColor = getBorderColor(dueDateStatus, colorScheme);
    const dueDateText = getDueDateText(dueDate);

    return (
      <TouchableOpacity
        onPress={action}
        style={[
          styles.card,
          { borderLeftColor: borderColor },
          done && { opacity: 0.5 },
        ]}
        activeOpacity={0.8}
      >
        <View style={styles.content}>
          <View style={styles.textContainer}>
            <Text style={styles.title}>{titre}</Text>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
              {dueDateText && <Text style={styles.subtitle}>{dueDateText}</Text>}
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
            <View style={[styles.checkCircle, done && styles.checkCircleDone]}>
              {done && (
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
    prevProps.done === nextProps.done &&
    prevProps.xp === nextProps.xp &&
    prevProps.titre === nextProps.titre &&
    prevProps.dueDate === nextProps.dueDate
);

export default TaskComponent;
