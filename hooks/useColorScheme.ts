import { useEffectiveColorScheme } from '@/context/ThemeContext';

// Expose the app-wide effective color scheme (user preference overrides system)
export function useColorScheme() {
  return useEffectiveColorScheme();
}
