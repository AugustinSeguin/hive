import React, { useEffect, useState } from 'react';
import { View, Text, Switch, StyleSheet, TouchableOpacity } from 'react-native';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import Sizes from '@/constants/Sizes';
import { getNotificationSettings, saveNotificationSettings, NotificationSettings } from '@/services/settings';
import { applyBackgroundPreferences } from '@/services/background';
import { applyNotificationPreferences, scheduleTestBurst } from '@/services/notifications';

const FREQUENCIES = [15, 30, 60];

export default function SettingsScreen() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  const [prefs, setPrefs] = useState<NotificationSettings | null>(null);

  useEffect(() => {
    (async () => {
      const s = await getNotificationSettings();
      setPrefs(s);
    })();
  }, []);

  const update = async (partial: Partial<NotificationSettings>) => {
    const next = await saveNotificationSettings(partial);
    setPrefs(next);
    await applyBackgroundPreferences();
    await applyNotificationPreferences();
  };

  if (!prefs) return null;

  return (
    <View style={[styles.container, { backgroundColor: theme.background }] }>
      <Text style={[styles.sectionTitle, { color: theme.text }]}>Rappels de fond</Text>
      <View style={styles.row}>
        <Text style={[styles.label, { color: theme.text }]}>Activer</Text>
        <Switch value={prefs.enabled} onValueChange={(v) => update({ enabled: v })} />
      </View>

      <Text style={[styles.sectionTitle, { color: theme.text }]}>Fréquence (min)</Text>
      <View style={styles.row}>
        {FREQUENCIES.map((m) => (
          <TouchableOpacity
            key={m}
            style={[styles.chip, { borderColor: theme.separator, backgroundColor: prefs.frequencyMinutes === m ? theme.tint : 'transparent' }]}
            onPress={() => update({ frequencyMinutes: m })}
          >
            <Text style={{ color: prefs.frequencyMinutes === m ? theme.background : theme.text }}>{m}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={[styles.sectionTitle, { color: theme.text }]}>Mode de rappel</Text>
      <View style={styles.row}>
        <TouchableOpacity style={[styles.chip, { borderColor: theme.separator, backgroundColor: theme.tint }]}
          onPress={() => update({ mode: 'per-task' })}
        >
          <Text style={{ color: theme.background }}>Par tâche (détaillé)</Text>
        </TouchableOpacity>
      </View>

      <View style={{ height: Sizes.SPACING_LG }} />
      <TouchableOpacity style={[styles.testButton, { backgroundColor: theme.tint }]} onPress={() => scheduleTestBurst()}>
        <Text style={{ color: theme.background, fontWeight: '600' }}>Tester notifications (burst)</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: Sizes.SPACING_LG },
  sectionTitle: { fontSize: Sizes.FONT_SIZE_LG, fontWeight: '700', marginTop: Sizes.SPACING_MD, marginBottom: Sizes.SPACING_SM },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, flexWrap: 'wrap' },
  label: { fontSize: Sizes.FONT_SIZE_MD },
  chip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999, borderWidth: 1 },
  testButton: { alignItems: 'center', justifyContent: 'center', paddingVertical: 12, borderRadius: Sizes.BUTTON_RADIUS },
});
