import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export type Theme = 'original' | 'light' | 'dark';
export type Lang = 'en' | 'sr';

/** Browser-bar colour per theme (matches --vitrine in index.css). */
const THEME_COLOR: Record<Theme, string> = { original: '#0e1418', dark: '#0f1011', light: '#eef1f3' };
const HTML_LANG: Record<Lang, string> = { en: 'en', sr: 'sr-Latn' };

interface SettingsState {
  theme: Theme;
  lang: Lang;
  setTheme: (theme: Theme) => void;
  /** Use `changeLanguage` from src/i18n, which loads the language before switching. */
  setLang: (lang: Lang) => void;
}

/** Display preferences, remembered per browser. index.html applies them before first paint too. */
export const useSettings = create<SettingsState>()(
  persist(
    (set) => ({
      theme: 'original',
      lang: 'en',
      setTheme: (theme) => set({ theme }),
      setLang: (lang) => set({ lang }),
    }),
    { name: 'pm.settings', storage: createJSONStorage(() => localStorage), partialize: (s) => ({ theme: s.theme, lang: s.lang }) },
  ),
);

/** Mirrors the settings onto <html>: theme attribute, browser-bar colour and lang. */
function applyToDocument({ theme, lang }: Pick<SettingsState, 'theme' | 'lang'>) {
  const root = document.documentElement;
  root.dataset.theme = theme;
  root.lang = HTML_LANG[lang];
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', THEME_COLOR[theme]);
}
// Tests import this module in Node, where there is no document.
if (typeof document !== 'undefined') {
  applyToDocument(useSettings.getState());
  useSettings.subscribe(applyToDocument);
}
