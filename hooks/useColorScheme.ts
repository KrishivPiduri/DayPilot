import { useThemeContext } from '@/hooks/ThemeContext';

export function useColorScheme() {
  return useThemeContext().theme;
}
