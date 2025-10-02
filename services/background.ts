import * as TaskManager from 'expo-task-manager';
import * as BackgroundFetch from 'expo-background-fetch';
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getNotificationSettings } from './settings';

export const TASK_NAME = 'task-reminder-background';

TaskManager.defineTask(TASK_NAME, async () => {
  try {
    // Respect user settings (enabled only)
    try {
      const rawPrefs = await AsyncStorage.getItem('notificationSettings');
      if (rawPrefs) {
        const prefs = JSON.parse(rawPrefs);
        if (!prefs?.enabled) {
          return BackgroundFetch.BackgroundFetchResult.NoData;
        }
      }
    } catch {}

    // Read tasks from cache and craft a short reminder
    let body = 'Pensez à vos tâches du jour.';
    try {
      const raw = await AsyncStorage.getItem('tasks');
      if (raw) {
        const tasks = JSON.parse(raw) as Array<any>;
        const pending = tasks?.filter((t) => !t?.done) ?? [];
        if (pending.length > 0) {
          const first = pending[0];
          const titre = (first?.titre ?? 'Une tâche') as string;
          body = `${pending.length} à faire. Prochaine: ${titre}`;
        } else {
          body = "Aucune tâche en retard. Ouvrez l'app pour vérifier.";
        }
      }
    } catch {}

    const { status } = await Notifications.getPermissionsAsync();
    if (status !== 'granted') {
      return BackgroundFetch.BackgroundFetchResult.NoData;
    }

    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Rappel Hive',
        body,
      },
      trigger: null, // immediate
    });

    return BackgroundFetch.BackgroundFetchResult.NewData;
  } catch (e) {
    return BackgroundFetch.BackgroundFetchResult.Failed;
  }
});

export async function registerBackgroundReminderTask(minIntervalSeconds: number = 900) {
  const status = await BackgroundFetch.getStatusAsync();
  if (
    status === BackgroundFetch.BackgroundFetchStatus.Restricted ||
    status === BackgroundFetch.BackgroundFetchStatus.Denied
  ) {
    return false;
  }

  const already = await TaskManager.isTaskRegisteredAsync(TASK_NAME);
  const interval = Math.max(900, Math.floor(minIntervalSeconds));
  if (!already) {
    await BackgroundFetch.registerTaskAsync(TASK_NAME, {
      minimumInterval: interval, // >= 15 min recommended
      stopOnTerminate: false,
      startOnBoot: true,
    });
  }
  try {
    await BackgroundFetch.setMinimumIntervalAsync(interval);
  } catch {}
  return true;
}

export async function unregisterBackgroundReminderTask() {
  try {
    const registered = await TaskManager.isTaskRegisteredAsync(TASK_NAME);
    if (registered) await TaskManager.unregisterTaskAsync(TASK_NAME);
  } catch {}
}

// Apply background fetch settings based on user preferences
export async function applyBackgroundPreferences() {
  const prefs = await getNotificationSettings();
  if (!prefs.enabled) {
    await unregisterBackgroundReminderTask();
    return false;
  }
  await registerBackgroundReminderTask((prefs.frequencyMinutes || 15) * 60);
  return true;
}
