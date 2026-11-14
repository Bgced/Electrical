'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { translations, type Lang, type I18nKey } from '@/lib/i18n';

type Ctx = {
  lang: Lang;
  setLang: (l: Lang) => void;
  toggleLang: () => void;
  t: (key: I18nKey) => string;
  theme: 'dark' | 'light';
  toggleTheme: () => void;
};

const AppContext = createContext<Ctx | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>('id');
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const savedLang = (localStorage.getItem('lang') as Lang) || 'id';
    const savedTheme = (localStorage.getItem('theme') as 'dark' | 'light') || 'dark';
    setLangState(savedLang === 'en' ? 'en' : 'id');
    setTheme(savedTheme === 'light' ? 'light' : 'dark');
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    const root = document.documentElement;
    root.classList.toggle('dark', theme === 'dark');
    root.classList.toggle('light', theme === 'light');
    localStorage.setItem('theme', theme);
  }, [theme, ready]);

  const value = useMemo<Ctx>(
    () => ({
      lang,
      setLang: (l) => {
        setLangState(l);
        localStorage.setItem('lang', l);
      },
      toggleLang: () => {
        const next = lang === 'id' ? 'en' : 'id';
        setLangState(next);
        localStorage.setItem('lang', next);
      },
      t: (key) => translations[lang][key] ?? translations.id[key] ?? key,
      theme,
      toggleTheme: () => setTheme((v) => (v === 'dark' ? 'light' : 'dark')),
    }),
    [lang, theme]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
}