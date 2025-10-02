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
      // New API (shouldShowAlert is deprecated)
      shouldShowBanner: true,
      shouldShowList: true,
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
    if (task.done) continue;

    const midnightNow = new Date(now);
    midnightNow.setHours(0, 0, 0, 0);
    const midnightDue = new Date(due);
    midnightDue.setHours(0, 0, 0, 0);
    const diffDays = Math.round((midnightDue.getTime() - midnightNow.getTime()) / 86400000);

    let title = 'Tâche à faire';
    if (diffDays < 0) title = 'Tâche en retard';
    else if (diffDays === 0) title = 'Tâche du jour';
    else if (diffDays === 1) title = 'Tâche pour demain';
    else title = 'Tâche à venir';

    const rel = diffDays < 0
      ? `en retard (${Math.abs(diffDays)}j)`
      : diffDays === 0
      ? `aujourd'hui`
      : diffDays === 1
      ? `demain`
      : diffDays <= 7
      ? `dans ${diffDays}j`
      : `le ${due.toLocaleDateString()}`;
    const body = `${task.titre} ${rel}`;

    const dayBefore = new Date(due);
    dayBefore.setDate(dayBefore.getDate() - 1);

    const preReminder = atTime(dayBefore, 18, 0);
    const morningReminder = atTime(due, 9, 0);
    const eveningReminder = atTime(due, 17, 0);

    const toSchedule: Date[] = [];
    if (diffDays === 1 && preReminder.getTime() > now.getTime()) toSchedule.push(preReminder);
    if (diffDays >= 0 && morningReminder.getTime() > now.getTime()) toSchedule.push(morningReminder);
    if (diffDays === 0 && eveningReminder.getTime() > now.getTime()) toSchedule.push(eveningReminder);

    for (const when of toSchedule) {
      try {
        const id = await Notifications.scheduleNotificationAsync({
          content: {
            title,
            body,
            data: { taskId: task.id ?? null, deepLink: 'hive://(tabs)' },
          },
          trigger: { date: when, channelId: Platform.OS === 'android' ? 'reminders' : undefined } as any,
        });
        scheduledIds.push(id);
      } catch {}
    }

    if (diffDays < 0) {
      try {
        const id = await Notifications.scheduleNotificationAsync({
          content: {
            title: 'Tâche en retard',
            body: `${task.titre} en retard (${Math.abs(diffDays)}j)`,
            data: { taskId: task.id ?? null, deepLink: 'hive://(tabs)' },
          },
          trigger: { hour: 10, minute: 0, repeats: true, channelId: Platform.OS === 'android' ? 'reminders' : undefined } as any,
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

// Note: Daily summaries are disabled per product decision (only per-task notifications are allowed).
export async function scheduleDailySummaries() { await clearDailySummaries(); }

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
  // Always disable summaries; only per-task notifications are allowed
  await clearDailySummaries();

  let source = tasks;
  if (!source) {
    try {
      const raw = await AsyncStorage.getItem('tasks');
      if (raw) source = JSON.parse(raw);
    } catch {}
  }
  if (source && Array.isArray(source)) {
    await scheduleTaskReminders(source as SchedulableTask[]);
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
