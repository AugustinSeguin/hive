import React, { useEffect, useState, useCallback } from "react";
import { Alert, SectionList, StyleSheet, View } from "react-native";

import ButtonComponent from "@/components/ButtonComponent";
import type { TaskProps } from "@/components/TaskComponent";
import TaskComponent from "@/components/TaskComponent";
import { ThemedText } from "@/components/ThemedText";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import { router } from "expo-router";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

function filterTasksByDate(tasks: TaskProps[]) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const lateTasks: TaskProps[] = [];
  const soonTasks: TaskProps[] = [];
  const currentWeekTasks: TaskProps[] = [];
  const laterTasks: TaskProps[] = [];
  const deactivatedTasks: TaskProps[] = [];

  for (const task of tasks) {
    if (task.deactivated) {
      deactivatedTasks.push(task);
      continue;
    }
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
  return {
    lateTasks,
    soonTasks,
    currentWeekTasks,
    laterTasks,
    deactivatedTasks,
  };
}

export default function HomeScreen() {
  const [lateTasks, setLateTasks] = useState<TaskProps[]>([]);
  const [soonTasks, setSoonTasks] = useState<TaskProps[]>([]);
  const [currentWeekTasks, setCurrentWeekTasks] = useState<TaskProps[]>([]);
  const [laterTasks, setLaterTasks] = useState<TaskProps[]>([]);
  const [deactivatedTasks, setDeactivatedTasks] = useState<TaskProps[]>([]);

  const fetchTasks = async () => {
    try {
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
        Alert.alert(
          "OOPS...",
          "Une erreur est survenue lors de la récupération des tâches."
        );
        return false;
      }
      const rawTasks = await response.json();

      tasks = rawTasks.map((t: any) => ({
        id: t.id,
        titre: t.title ?? t.titre ?? "",
        repetition: t.repetition ?? 1,
        dueDate: t.dueDate ?? null,
        deactivated: t.deactivated ?? false,
        xp: t.xp ?? 0,
        dueDateStatus: undefined as any,
        action: () => {},
      }));

      tasks.sort((a, b) => {
        if (a.dueDate && b.dueDate) {
          return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        }
        return 0;
      });
      const {
        lateTasks,
        soonTasks,
        currentWeekTasks,
        laterTasks,
        deactivatedTasks,
      } = filterTasksByDate(tasks);

      setLateTasks(lateTasks);
      setSoonTasks(soonTasks);
      setCurrentWeekTasks(currentWeekTasks);
      setLaterTasks(laterTasks);
      setDeactivatedTasks(deactivatedTasks);
      await AsyncStorage.setItem("tasks", JSON.stringify(tasks));
    } catch (e) {
      const cached = await AsyncStorage.getItem("tasks");
      if (!cached) return;
      const tasks = JSON.parse(cached);
      const {
        lateTasks,
        soonTasks,
        currentWeekTasks,
        laterTasks,
        deactivatedTasks,
      } = filterTasksByDate(tasks);

      setLateTasks(lateTasks);
      setSoonTasks(soonTasks);
      setCurrentWeekTasks(currentWeekTasks);
      setLaterTasks(laterTasks);
      setDeactivatedTasks(deactivatedTasks);

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
    { title: "Terminé", data: deactivatedTasks },
  ].filter((section) => section.data.length > 0);

  return (
    <View style={{ flex: 1 }}>
      {sections.length === 0 ? (
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <ThemedText style={{ fontSize: 16 }}>
            Rien à voir pour l'instant
          </ThemedText>
        </View>
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={(item) => `${item.id}-${item.deactivated}`}
          renderItem={({ item }) => (
            <TaskComponent
              {...item}
              action={async () => {
                await toggleTask(item.id);
              }}
              onLongPress={() => {
                if (item.id != null) {
                  router.push(`/editTask?id=${item.id}`);
                }
              }}
            />
          )}
          renderSectionHeader={({ section }) => (
            <ThemedText style={styles.sectionHeader}>
              {section.title}
            </ThemedText>
          )}
        />
      )}
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

  async function toggleTask(id: number | undefined | null) {
    if (id == null) return;
    try {
      const cached = await AsyncStorage.getItem("tasks");
      if (cached) {
        const tasks = JSON.parse(cached);
        const index = tasks.findIndex((task: any) => task.id === id);
        if (index !== -1) {
          let updatedTask = {
            ...tasks[index],
            deactivated: !tasks[index].deactivated,
          };

          const updatedTasks = [...tasks];
          updatedTasks[index] = updatedTask;

          await AsyncStorage.setItem("tasks", JSON.stringify(updatedTasks));
          const url = `${API_URL}/tasks/${id}`;
          const token = await AsyncStorage.getItem("userToken");

          await fetch(url, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: token ? `Bearer ${token}` : "",
              "ngrok-skip-browser-warning": "1",
              "User-Agent": "MyApp/1.0.0",
            },
            // Do not allow client to change householdId
            body: JSON.stringify({
              title: updatedTask.title ?? updatedTask.titre,
              repetition: updatedTask.repetition,
              dueDate: updatedTask.dueDate,
              deactivated: updatedTask.deactivated,
              xp: updatedTask.xp,
            }),
          });

          const {
            lateTasks,
            soonTasks,
            currentWeekTasks,
            laterTasks,
            deactivatedTasks,
          } = filterTasksByDate(updatedTasks);
          setLateTasks(lateTasks);
          setSoonTasks(soonTasks);
          setCurrentWeekTasks(currentWeekTasks);
          setLaterTasks(laterTasks);
          setDeactivatedTasks(deactivatedTasks);
        }
      }
    } catch (e) {
      Alert.alert("OOPS...", "Une erreur est survenue lors de la mise à jour.");
      console.error("Erreur lors de la mise à jour de la tâche", e);
    }
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

