import React, { useEffect, useState } from "react";
import { StyleSheet, SectionList } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { SafeAreaView } from "react-native-safe-area-context";
import TaskComponent from "@/components/TaskComponent";
import type { TaskProps } from "@/components/TaskComponent";

// Fake data for TaskComponent
const fakeTasks: TaskProps[] = [
  {
    dueDateStatus: "late",
    action: () => console.log("task done: Nettoyer la salle de bain"),
    titre: "Nettoyer la salle de bain",
    dueDate: "2025-09-10",
    done: false,
  },
  {
    dueDateStatus: "late",
    action: () => console.log("task done: Sortir les poubelles"),
    titre: "Sortir les poubelles",
    dueDate: "2025-09-08",
    done: true,
  },
  {
    dueDateStatus: "soon",
    action: () => console.log("task done: Faire la lessive"),
    titre: "Faire la lessive",
    dueDate: "2025-09-12",
    done: false,
  },
  {
    dueDateStatus: "soon",
    action: () => console.log("task done: Passer l'aspirateur"),
    titre: "Passer l'aspirateur",
    dueDate: "2025-09-13",
    done: false,
  },
  {
    dueDateStatus: "currentWeek",
    action: () => console.log("task done: Arroser les plantes"),
    titre: "Arroser les plantes",
    dueDate: "2025-09-15",
    done: false,
  },
  {
    dueDateStatus: "currentWeek",
    action: () => console.log("task done: Faire les courses"),
    titre: "Faire les courses",
    dueDate: "2025-09-16",
    done: false,
  },
  {
    dueDateStatus: "later",
    action: () => console.log("task done: Nettoyer le garage"),
    titre: "Nettoyer le garage",
    dueDate: "2025-09-25",
    done: false,
  },
  {
    dueDateStatus: "later",
    action: () => console.log("task done: Laver la voiture"),
    titre: "Laver la voiture",
    dueDate: "2025-09-28",
    done: false,
  },
];

// Helper pour filtrer les tâches par date
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

  useEffect(() => {
    const fetchTasks = async () => {
      await new Promise((resolve) => setTimeout(resolve, 500));
      let tasks = fakeTasks.sort((a, b) => {
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
    };
    fetchTasks();
  }, []);

  const sections = [
    { title: "En retard", data: lateTasks },
    { title: "Proche échéance", data: soonTasks },
    { title: "Cette semaine", data: currentWeekTasks },
    { title: "Ce mois", data: laterTasks },
  ].filter((section) => section.data.length > 0);

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ThemedText style={styles.headerTitle}>Mes Tâches</ThemedText>
      <SectionList
        sections={sections}
        keyExtractor={(item) => item.titre + "-" + item.dueDate}
        renderItem={({ item }) => <TaskComponent {...item} />}
        renderSectionHeader={({ section }) => (
          <ThemedText style={styles.sectionHeader}>{section.title}</ThemedText>
        )}
      />
    </SafeAreaView>
  );
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
});
