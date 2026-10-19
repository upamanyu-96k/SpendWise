import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const KEY = 'spendwise_theme';
const ThemeContext = createContext(null);

const systemPrefersDark = () => window.matchMedia('(prefers-color-scheme: dark)').matches;

export function ThemeProvider({ children }) {
  const [preference, setPreference] = useState(() => localStorage.getItem(KEY) || 'dark');
  const [systemDark, setSystemDark] = useState(systemPrefersDark);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = () => setSystemDark(mq.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  const resolved = preference === 'system' ? (systemDark ? 'dark' : 'light') : preference;

  useEffect(() => {
    document.documentElement.classList.toggle('dark', resolved === 'dark');
  }, [resolved]);

  const value = useMemo(
    () => ({
      preference,
      resolved,
      setPreference: (p) => {
        localStorage.setItem(KEY, p);
        setPreference(p);
      },
    }),
    [preference, resolved]
  );
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export const useTheme = () => useContext(ThemeContext);

// Recharts draws SVG, so it needs real colour values rather than CSS classes
export function useChartTheme() {
  const dark = useTheme().resolved === 'dark';
  return {
    dark,
    grid: dark ? '#24304E' : '#E2E8F0',
    tick: dark ? '#8A97B2' : '#64748B',
    income: dark ? '#2DD4BF' : '#0D9488',
    expense: dark ? '#F472B6' : '#DB2777',
    surface: dark ? '#0F1526' : '#FFFFFF',
  };
}
