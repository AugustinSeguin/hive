import AsyncStorage from '@react-native-async-storage/async-storage';

export type NotificationMode = 'per-task';

export type NotificationSettings = {
  enabled: boolean;
  frequencyMinutes: number; // background fetch desired interval
  mode: NotificationMode;
};

const KEY = 'notificationSettings';

export const defaultSettings: NotificationSettings = {
  enabled: true,
  frequencyMinutes: 15,
  mode: 'per-task',
};

export async function getNotificationSettings(): Promise<NotificationSettings> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (!raw) return defaultSettings;
    const parsed = JSON.parse(raw);
    const normalized: NotificationSettings = {
      ...defaultSettings,
      ...parsed,
      // normalize
      frequencyMinutes: Math.max(15, Math.min(240, Number(parsed.frequencyMinutes) || 15)),
      mode: 'per-task',
    };
    return normalized;
  } catch {
    return defaultSettings;
  }
}

export async function saveNotificationSettings(partial: Partial<NotificationSettings>) {
  const current = await getNotificationSettings();
  const next: NotificationSettings = { ...current, ...partial };
  await AsyncStorage.setItem(KEY, JSON.stringify(next));
  return next;
}
