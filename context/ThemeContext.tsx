import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useColorScheme as useRNColorScheme } from 'react-native';

type ThemeChoice = 'light' | 'dark' | 'system';
type EffectiveScheme = 'light' | 'dark';

type ThemeContextValue = {
  choice: ThemeChoice;
  colorScheme: EffectiveScheme;
  setChoice: (next: ThemeChoice) => void;
  toggleLightDark: () => void;
};

const STORAGE_KEY = 'themeChoice';

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemePreferenceProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useRNColorScheme();
  const [choice, setChoice] = useState<ThemeChoice>('system');

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw === 'light' || raw === 'dark' || raw === 'system') setChoice(raw);
      } catch {}
    })();
  }, []);

  const setChoicePersist = (next: ThemeChoice) => {
    setChoice(next);
    AsyncStorage.setItem(STORAGE_KEY, next).catch(() => {});
  };

  const effective: EffectiveScheme = useMemo(() => {
    if (choice === 'system') return (systemScheme ?? 'light') as EffectiveScheme;
    return choice;
  }, [choice, systemScheme]);

  const value: ThemeContextValue = useMemo(() => ({
    choice,
    colorScheme: effective,
    setChoice: setChoicePersist,
    toggleLightDark: () => setChoicePersist(effective === 'dark' ? 'light' : 'dark'),
  }), [choice, effective]);

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useThemePreference() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useThemePreference must be used within ThemePreferenceProvider');
  return ctx;
}

export function useEffectiveColorScheme() {
  const ctx = useContext(ThemeContext);
  if (ctx) return ctx.colorScheme;
  const scheme = useRNColorScheme();
  return (scheme ?? 'light') as EffectiveScheme;
}

