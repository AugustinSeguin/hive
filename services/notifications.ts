import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getNotificationSettings } from './settings';

export type SchedulableTask = {
  id?: number | string | null;
  titre?: string;
  dueDate?: string | null;
  done?: boolean;
};

const STORAGE_TASK_IDS = 'taskReminderIds';
const STORAGE_SUMMARY_IDS = 'summaryReminderIds';

export async function initNotifications() {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: false,
      shouldSetBadge: false,
    }),
  });

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    return false;
  }

  if (Platform.OS === 'android') {
    try {
      await Notifications.setNotificationChannelAsync('reminders', {
        name: 'Rappels des tâches',
        importance: Notifications.AndroidImportance.DEFAULT,
        sound: undefined,
        vibrationPattern: [200, 100, 200],
        lightColor: '#FF231F7C',
      });
    } catch {}
  }
  return true;
}

export async function clearTaskReminders() {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_TASK_IDS);
    if (raw) {
      const ids: string[] = JSON.parse(raw);
      await Promise.all(ids.map((id) => Notifications.cancelScheduledNotificationAsync(id)));
    }
  } catch {}
  await AsyncStorage.removeItem(STORAGE_TASK_IDS);
}

function atTime(date: Date, hours: number, minutes: number) {
  const d = new Date(date);
  d.setHours(hours, minutes, 0, 0);
  return d;
}

export async function scheduleTaskReminders(tasks: SchedulableTask[]) {
  const enabled = await initNotifications();
  if (!enabled) return;

  await clearTaskReminders();

  const now = new Date();
  const scheduledIds: string[] = [];

  for (const task of tasks) {
    if (!task?.dueDate || !task.titre) continue;
    const due = new Date(task.dueDate);
    if (isNaN(due.getTime())) continue;

    const title = 'Rappel de tâche';
    const body = `${task.titre}`;

    const dayBefore = new Date(due);
    dayBefore.setDate(dayBefore.getDate() - 1);

    const preReminder = atTime(dayBefore, 18, 0);
    const dayReminder = atTime(due, 9, 0);

    const toSchedule: Date[] = [];
    if (preReminder.getTime() > now.getTime()) toSchedule.push(preReminder);
    if (dayReminder.getTime() > now.getTime()) toSchedule.push(dayReminder);

    for (const when of toSchedule) {
      try {
        const id = await Notifications.scheduleNotificationAsync({
          content: { title, body },
          trigger: { date: when, channelId: Platform.OS === 'android' ? 'reminders' : undefined } as any,
        });
        scheduledIds.push(id);
      } catch {}
    }
  }

  await AsyncStorage.setItem(STORAGE_TASK_IDS, JSON.stringify(scheduledIds));
}

export async function clearDailySummaries() {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_SUMMARY_IDS);
    if (raw) {
      const ids: string[] = JSON.parse(raw);
      await Promise.all(ids.map((id) => Notifications.cancelScheduledNotificationAsync(id)));
    }
  } catch {}
  await AsyncStorage.removeItem(STORAGE_SUMMARY_IDS);
}

// Schedule two repeating daily summaries (9:00 and 18:00)
export async function scheduleDailySummaries() {
  const enabled = await initNotifications();
  if (!enabled) return;
  await clearDailySummaries();
  const scheduled: string[] = [];
  const hours = [9, 18];
  for (const h of hours) {
    try {
      const id = await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Résumé des tâches',
          body: "Pensez à vos tâches du jour dans Hive.",
        },
        trigger: {
          hour: h,
          minute: 0,
          repeats: true,
          channelId: Platform.OS === 'android' ? 'reminders' : undefined,
        } as any,
      });
      scheduled.push(id);
    } catch {}
  }
  await AsyncStorage.setItem(STORAGE_SUMMARY_IDS, JSON.stringify(scheduled));
}

export async function clearAllSchedules() {
  await clearTaskReminders();
  await clearDailySummaries();
}

// Apply preferences: schedule summaries and/or per-task reminders depending on user settings
export async function applyNotificationPreferences(tasks?: SchedulableTask[]) {
  const prefs = await getNotificationSettings();
  if (!prefs.enabled) {
    await clearAllSchedules();
    return;
  }
  if (prefs.mode === 'summary' || prefs.mode === 'both') {
    await scheduleDailySummaries();
  } else {
    await clearDailySummaries();
  }
  if (prefs.mode === 'per-task' || prefs.mode === 'both') {
    let source = tasks;
    if (!source) {
      try {
        const raw = await AsyncStorage.getItem('tasks');
        if (raw) source = JSON.parse(raw);
      } catch {}
    }
    if (source && Array.isArray(source)) {
      await scheduleTaskReminders(source as SchedulableTask[]);
    }
  } else {
    await clearTaskReminders();
  }
}

// Schedules a short burst of test notifications at small intervals
export async function scheduleTestBurst(count = 3, seconds = 30) {
  const ok = await initNotifications();
  if (!ok) return;
  for (let i = 1; i <= count; i++) {
    try {
      await Notifications.scheduleNotificationAsync({
        content: { title: 'Test notification', body: `Test ${i}/${count}` },
        trigger: { seconds: i * seconds },
      });
    } catch {}
  }
}

