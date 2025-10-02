import React, { useCallback, useEffect, useState } from "react";
import { Alert, SectionList, StyleSheet, View } from "react-native";

import AsyncStorage from "@react-native-async-storage/async-storage";
import ButtonComponent from "@/components/ButtonComponent";
import TaskComponent from "@/components/TaskComponent";
import type { TaskProps } from "@/components/TaskComponent";
import { ThemedText } from "@/components/ThemedText";
import { applyNotificationPreferences } from "@/services/notifications";
import { router } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

function filterTasksByDate(tasks: TaskProps[]) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const lateTasks: TaskProps[] = [];
  const soonTasks: TaskProps[] = [];
  const currentWeekTasks: TaskProps[] = [];
  const laterTasks: TaskProps[] = [];

  for (const task of tasks) {
    if (!task.dueDate) continue;
    const dueDate = new Date(task.dueDate);
    dueDate.setHours(0, 0, 0, 0);
    const diffDays = Math.round(
      (dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    );
    if (diffDays < 0) {
      lateTasks.push(task);
    } else if (diffDays === 0 || diffDays === 1) {
      soonTasks.push(task);
    } else if (diffDays > 1 && diffDays <= 7) {
      currentWeekTasks.push(task);
    } else if (diffDays > 7) {
      laterTasks.push(task);
    }
  }
  return { lateTasks, soonTasks, currentWeekTasks, laterTasks };
}

export default function HomeScreen() {
  const [lateTasks, setLateTasks] = useState<TaskProps[]>([]);
  const [soonTasks, setSoonTasks] = useState<TaskProps[]>([]);
  const [currentWeekTasks, setCurrentWeekTasks] = useState<TaskProps[]>([]);
  const [laterTasks, setLaterTasks] = useState<TaskProps[]>([]);

  const fetchTasks = async () => {
    try {
      let cached = await AsyncStorage.getItem("tasks");
      const token = await AsyncStorage.getItem("userToken");
      let tasks: TaskProps[] = [];
      if (!token) {
        Alert.alert(
          "Erreur d'authentification",
          "Token non trouvé. Veuillez vous reconnecter."
        );
        return false;
      }

      const response = await fetch(`${API_URL}/tasks`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          "ngrok-skip-browser-warning": "1",
          "User-Agent": "MyApp/1.0.0",
        },
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
      await AsyncStorage.setItem("tasks", JSON.stringify(tasks));

      tasks.sort((a, b) => {
        if (a.dueDate && b.dueDate) {
          return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        }
        return 0;
      });
      const { lateTasks, soonTasks, currentWeekTasks, laterTasks } =
        filterTasksByDate(tasks);

      setLateTasks(lateTasks);
      setSoonTasks(soonTasks);
      setCurrentWeekTasks(currentWeekTasks);
      setLaterTasks(laterTasks);

      try {
        await applyNotificationPreferences(tasks);
      } catch (e) {
        console.warn('[notifications] apply preferences failed', e);
      }
    } catch (e) {
     const cached = await AsyncStorage.getItem("tasks");
      if (!cached) return;
      const tasks = JSON.parse(cached);
      const { lateTasks, soonTasks, currentWeekTasks, laterTasks } =
        filterTasksByDate(tasks);

      setLateTasks(lateTasks);
      setSoonTasks(soonTasks);
      setCurrentWeekTasks(currentWeekTasks);
      setLaterTasks(laterTasks);
      console.error(e);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchTasks();
    }, [])
  );

  const sections = [
    { title: "En retard", data: lateTasks },
    { title: "Proche échéance", data: soonTasks },
    { title: "Cette semaine", data: currentWeekTasks },
    { title: "Ce mois", data: laterTasks },
  ].filter((section) => section.data.length > 0);

  return (
    <View style={{ flex: 1 }}>
      <SectionList
        sections={sections}
        keyExtractor={(item) => `${item.id}-${item.done}`}
        renderItem={({ item }) => (
          <TaskComponent
            {...item}
            action={async () => {
              await updateTask(item.id);
              await fetchTasks();
            }}
            onLongPress={() => {
              if (item.id != null) {
                router.push(`/editTask?id=${item.id}`);
              }
            }}
          />
        )}
        renderSectionHeader={({ section }) => (
          <ThemedText style={styles.sectionHeader}>{section.title}</ThemedText>
        )}
      />
      <ButtonComponent
        type="secondary"
        titre="+"
        action={() => {
          router.push("/addTask");
        }}
        style={styles.floatingButton}
      />
    </View>
  );
}

async function updateTask(id: number | undefined | null) {
  if (id == null) return;
  try {
    const cached = await AsyncStorage.getItem("tasks");
    if (!cached) return;
    const tasks = JSON.parse(cached);
    let updatedTask = null;
    const updatedTasks = tasks.map((task: any) => {
      if (task.id === id) {
        updatedTask = { ...task, done: !task.done };
        console.log(
          `[updateTask] toggling done for id=${id} (avant: ${
            task.done
          }, après: ${!task.done})`
        );
        return updatedTask;
      }
      return task;
    });
    await AsyncStorage.setItem("tasks", JSON.stringify(updatedTasks));

    if (updatedTask) {
      const url = `${API_URL}/tasks/${id}`;
      try {
        await fetch(url, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updatedTask),
        });
        console.log(`[updateTask] PUT sent to API for id=${id}`);
      } catch (err) {
        console.error(`[updateTask] PUT failed for id=${id}`, err);
      }
    }

    try {
      await applyNotificationPreferences(updatedTasks);
    } catch (e) {
      console.warn('[notifications] re-apply after update failed', e);
    }
  } catch (e) {
    console.error("Erreur lors de la mise à jour de la tâche", e);
  }
}

const styles = StyleSheet.create({
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    marginVertical: 16,
  },
  sectionHeader: {
    fontSize: 20,
    fontWeight: "600",
    backgroundColor: "transparent",
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  floatingButton: {
    position: "absolute",
    right: 24,
    bottom: 32,
    zIndex: 10,
    elevation: 10,
  },
});
