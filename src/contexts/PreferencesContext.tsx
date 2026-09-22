import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { ThemePreference } from '../types';
import { loadFromStorage, saveToStorage, STORAGE_KEYS } from '../utils/storage';

interface PreferencesContextValue {
  theme: ThemePreference;
  resolvedTheme: 'light' | 'dark';
  setTheme: (theme: ThemePreference) => void;
}

const PreferencesContext = createContext<PreferencesContextValue | undefined>(undefined);

const isThemePreference = (value: unknown): value is ThemePreference => value === 'light' || value === 'dark' || value === 'system';
const getSystemTheme = () => window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';

export function PreferencesProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<ThemePreference>(() => loadFromStorage(STORAGE_KEYS.preferences, 'system', isThemePreference));
  const [systemTheme, setSystemTheme] = useState<'light' | 'dark'>(getSystemTheme);
  const resolvedTheme = theme === 'system' ? systemTheme : theme;

  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const update = () => setSystemTheme(media.matches ? 'dark' : 'light');
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', resolvedTheme === 'dark');
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', resolvedTheme === 'dark' ? '#081521' : '#0F766E');
  }, [resolvedTheme]);

  const updateTheme = (nextTheme: ThemePreference) => {
    setTheme(nextTheme);
    saveToStorage(STORAGE_KEYS.preferences, nextTheme);
  };

  return <PreferencesContext.Provider value={{ theme, resolvedTheme, setTheme: updateTheme }}>{children}</PreferencesContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function usePreferences(): PreferencesContextValue {
  const context = useContext(PreferencesContext);
  if (!context) throw new Error('usePreferences requiere PreferencesProvider');
  return context;
}
