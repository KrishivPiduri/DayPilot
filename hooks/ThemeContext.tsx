import React, { createContext, useContext, useState, useEffect } from 'react';
import { Appearance, ColorSchemeName, AppearanceListener } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const THEME_KEY = 'settings_theme';
export type ThemePref = 'system' | 'light' | 'dark';

interface ThemeContextValue {
  theme: 'light' | 'dark';
  themePref: ThemePref;
  setThemePref: (pref: ThemePref) => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: 'light',
  themePref: 'system',
  setThemePref: () => {},
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const systemScheme = (Appearance.getColorScheme() as 'light' | 'dark') || 'light';
  const [themePref, setThemePrefState] = useState<ThemePref>('system');
  const [theme, setTheme] = useState<'light' | 'dark'>(systemScheme);

  // load stored pref
  useEffect(() => {
    AsyncStorage.getItem(THEME_KEY).then(pref => {
      if (pref === 'light' || pref === 'dark' || pref === 'system') {
        setThemePrefState(pref);
      }
    });
  }, []);

  // update theme when pref or system changes
  useEffect(() => {
    const apply = (pref: ThemePref) => {
      if (pref === 'light' || pref === 'dark') {
        setTheme(pref);
      } else {
        setTheme(Appearance.getColorScheme() === 'dark' ? 'dark' : 'light');
      }
    };
    apply(themePref);
    const listener = Appearance.addChangeListener(({ colorScheme }) => {
      if (themePref === 'system') {
        setTheme(colorScheme === 'dark' ? 'dark' : 'light');
      }
    });
    return () => listener.remove();
  }, [themePref]);

  // setter that saves
  const setThemePref = (pref: ThemePref) => {
    setThemePrefState(pref);
    AsyncStorage.setItem(THEME_KEY, pref);
  };

  return (
    <ThemeContext.Provider value={{ theme, themePref, setThemePref }}>
      {children}
    </ThemeContext.Provider>
  );
};

export function useThemeContext(): ThemeContextValue {
  return useContext(ThemeContext);
}
