import { MoonIcon, SunIcon } from 'lucide-react';
import { usePreferences } from '../../contexts/PreferencesContext';

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = usePreferences();
  const isDark = resolvedTheme === 'dark';
  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      aria-label={isDark ? 'Activar modo claro' : 'Activar modo oscuro'}
      className="flex h-10 w-10 items-center justify-center rounded-lg text-ink transition-colors duration-150 hover:bg-neutral">
      {isDark ? <SunIcon className="h-5 w-5" aria-hidden="true" /> : <MoonIcon className="h-5 w-5" aria-hidden="true" />}
    </button>
  );
}
