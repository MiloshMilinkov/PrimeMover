/**
 * Translation, gettext style: English text is the key. English is built in; other
 * languages are dictionaries (English -> translation) loaded on demand, so English
 * visitors never download them. Anything missing falls back to English, and
 * tests/i18n.test.ts fails when a string has no Serbian translation.
 *
 *   t('Popular exercises')                       -> UI copy and data text alike
 *   t('Show all {n}', { n: 12 })                 -> placeholders
 *   n(3, 'exercise', 'exercises')                -> plurals (Serbian has three forms)
 *   list(['a', 'b', 'c'])                        -> "a, b and c" / "a, b i c"
 */
import { useMemo } from 'react';
import { useSettings, type Lang } from '../state/settings';

type Dictionary = Record<string, string>;
const dictionaries: Partial<Record<Lang, Dictionary>> = {};

/** Loads a language's dictionary once. English needs none. */
export async function loadLanguage(lang: Lang) {
  if (lang === 'en' || dictionaries[lang]) return;
  dictionaries[lang] = (await import('./sr')).SR;
}

/** Loads the language, then switches to it, so the page never shows half-translated text. */
export async function changeLanguage(lang: Lang) {
  await loadLanguage(lang);
  useSettings.getState().setLang(lang);
}

const fill = (text: string, vars?: Record<string, string | number>) =>
  vars ? text.replace(/\{(\w+)\}/g, (_, k: string) => String(vars[k] ?? `{${k}}`)) : text;

/** Serbian plural form index: 1 vežba, 2–4 vežbe, 5+ vežbi (with the 11–14 exceptions). */
function serbianForm(count: number) {
  const n10 = count % 10;
  const n100 = count % 100;
  if (n10 === 1 && n100 !== 11) return 0;
  if (n10 >= 2 && n10 <= 4 && (n100 < 12 || n100 > 14)) return 1;
  return 2;
}

const LIST_LOCALE: Record<Lang, string> = { en: 'en-GB', sr: 'sr-Latn' };
const listFormats = new Map<Lang, Intl.ListFormat>();

export interface Translator {
  lang: Lang;
  t: (text: string, vars?: Record<string, string | number>) => string;
  /** `one` and `other` are the English forms; the dictionary holds the translation under "one|other". */
  n: (count: number, one: string, other: string, vars?: Record<string, string | number>) => string;
  list: (items: string[]) => string;
}

/**
 * A key may carry a context prefix when one English word needs different translations:
 * 'view::Back' (camera view) vs 'Back' (body area). English shows the part after "::".
 */
const withoutContext = (key: string) => (key.includes('::') ? key.slice(key.indexOf('::') + 2) : key);

export function translator(lang: Lang): Translator {
  const dict = dictionaries[lang];
  const t: Translator['t'] = (text, vars) => fill(dict?.[text] ?? withoutContext(text), vars);
  const n: Translator['n'] = (count, one, other, vars) => {
    const all = { n: count, ...vars };
    const forms = dict?.[`${one}|${other}`]?.split('|');
    if (lang === 'sr' && forms?.length === 3) return fill(forms[serbianForm(count)], all);
    return fill(count === 1 ? one : other, all);
  };
  const list: Translator['list'] = (items) => {
    if (!listFormats.has(lang)) listFormats.set(lang, new Intl.ListFormat(LIST_LOCALE[lang], { type: 'conjunction' }));
    return listFormats.get(lang)!.format(items);
  };
  return { lang, t, n, list };
}

/** The translator for the current language; re-renders the caller when the language changes. */
export function useT() {
  const lang = useSettings((s) => s.lang);
  return useMemo(() => translator(lang), [lang]);
}

/** For code outside React (search index, document title). */
export const currentTranslator = () => translator(useSettings.getState().lang);

/**
 * Marks English text for translation where it is defined but translated later, e.g.
 * option labels passed through t() at render time. It returns the text unchanged;
 * tests/i18n.test.ts collects msg('...') and t('...') literals to check the dictionaries.
 */
export const msg = (text: string) => text;
