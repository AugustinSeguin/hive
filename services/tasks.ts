import AsyncStorage from "@react-native-async-storage/async-storage";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export type Task = {
  id?: number;
  titre: string;
  description?: string;
  dueDate?: string; // ISO yyyy-mm-dd
  repetition?: number;
  deactivated?: boolean;
  xp?: number;
  done?: boolean;
};

async function getHouseholdId(): Promise<string | null> {
  try {
    return await AsyncStorage.getItem("householdId");
  } catch {
    return null;
  }
}

async function getToken(): Promise<string | null> {
  try {
    return await AsyncStorage.getItem("userToken");
  } catch {
    return null;
  }
}

export async function isInHousehold(): Promise<boolean> {
  const h = await getHouseholdId();
  return !!h;
}

async function createLocalId(): Promise<number> {
  const raw = await AsyncStorage.getItem("lastTaskId");
  const next = raw ? Number(raw) + 1 : 1;
  await AsyncStorage.setItem("lastTaskId", String(next));
  return next;
}

export async function getTasks(): Promise<Task[]> {
  const householdId = await getHouseholdId();
  if (householdId && API_URL) {
    try {
      const token = await getToken();
      const res = await fetch(`${API_URL}/households/${householdId}/tasks`, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      if (!res.ok) throw new Error("failed to fetch tasks");
      const data = await res.json();
      return Array.isArray(data) ? data : [];
    } catch (e) {
      console.warn("[tasksService] getTasks from API failed, fallback local", e);
      const local = await AsyncStorage.getItem("tasks");
      return local ? JSON.parse(local) : [];
    }
  }
  const local = await AsyncStorage.getItem("tasks");
  return local ? JSON.parse(local) : [];
}

export async function createTask(task: Task): Promise<Task | null> {
  const householdId = await getHouseholdId();
  if (householdId && API_URL) {
    const token = await getToken();
    try {
      const res = await fetch(`${API_URL}/households/${householdId}/tasks`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ ...task, householdId }),
      });
      if (!res.ok) throw new Error("createTask API failed");
      const created = await res.json();
      return created;
    } catch (e) {
      console.error("[tasksService] createTask API error", e);
      return null;
    }
  }
  // Local fallback
  const raw = await AsyncStorage.getItem("tasks");
  const list: Task[] = raw ? JSON.parse(raw) : [];
  const id = await createLocalId();
  const toStore = { ...task, id } as Task;
  list.push(toStore);
  await AsyncStorage.setItem("tasks", JSON.stringify(list));
  return toStore;
}

export async function updateTask(id: number, patch: Partial<Task>): Promise<void> {
  const householdId = await getHouseholdId();
  if (householdId && API_URL) {
    const token = await getToken();
    try {
      await fetch(`${API_URL}/tasks/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(patch),
      });
    } catch (e) {
      console.error("[tasksService] updateTask API error", e);
    }
    return;
  }
  const raw = await AsyncStorage.getItem("tasks");
  if (!raw) return;
  const list: Task[] = JSON.parse(raw);
  const next = list.map((t) => (t.id === id ? { ...t, ...patch } : t));
  await AsyncStorage.setItem("tasks", JSON.stringify(next));
}

export async function deleteTask(id: number): Promise<void> {
  const householdId = await getHouseholdId();
  if (householdId && API_URL) {
    const token = await getToken();
    try {
      await fetch(`${API_URL}/tasks/${id}`, {
        method: "DELETE",
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
    } catch (e) {
      console.error("[tasksService] deleteTask API error", e);
    }
    return;
  }
  const raw = await AsyncStorage.getItem("tasks");
  if (!raw) return;
  const list: Task[] = JSON.parse(raw);
  const next = list.filter((t) => t.id !== id);
  await AsyncStorage.setItem("tasks", JSON.stringify(next));
}

export async function syncLocalTasksToHousehold(householdId: string): Promise<number> {
  if (!API_URL) return 0;
  const token = await getToken();
  const raw = await AsyncStorage.getItem("tasks");
  const local: Task[] = raw ? JSON.parse(raw) : [];
  if (!local.length) {
    // Mark synced to avoid re-run
    await AsyncStorage.setItem(`syncedTasksForHousehold:${householdId}`, "1");
    return 0;
  }
  let created = 0;
  for (const t of local) {
    try {
      const res = await fetch(`${API_URL}/households/${householdId}/tasks`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ ...t, householdId }),
      });
      if (res.ok) created++;
    } catch (e) {
      console.error("[tasksService] sync single task failed", e);
    }
  }
  // After successful loop, clear local tasks to avoid duplicates
  try {
    await AsyncStorage.removeItem("tasks");
  } catch {}
  await AsyncStorage.setItem(`syncedTasksForHousehold:${householdId}`, "1");
  return created;
}

export async function syncIfNeeded(): Promise<void> {
  const householdId = await getHouseholdId();
  if (!householdId) return;
  const flag = await AsyncStorage.getItem(`syncedTasksForHousehold:${householdId}`);
  if (flag) return;
  await syncLocalTasksToHousehold(householdId);
}

