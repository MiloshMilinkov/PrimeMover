import Fuse from 'fuse.js/basic';
import { categoriesOf, EXERCISES, workingMuscleIds } from '../data/exercises';
import { CATEGORY_LABEL, EQUIPMENT_LABEL } from '../data/labels';
import { MUSCLE_BY_ID } from '../data/muscles';
import type { Category, Difficulty, Equipment, Exercise, MuscleId } from '../data/schema';
import { translator } from '../i18n';
import { fold } from './text';
import type { Lang } from '../state/settings';

export interface ExerciseFilters {
  muscle: MuscleId | null;
  equipment: Equipment | null;
  category: Category | null;
  difficulty: Difficulty | null;
}

export const NO_FILTERS: ExerciseFilters = { muscle: null, equipment: null, category: null, difficulty: null };

type Entry = { exercise: Exercise; name: string; aliases: string[]; muscles: string[]; tags: string[] };
const indexes = new Map<Lang, { fuse: Fuse<Entry>; entries: Entry[] }>();

/**
 * Built on the first search in each language. Names, aliases and tags match fuzzily
 * (typos, "pullup"). Muscle names match as plain substrings: long Latin names
 * fuzzy-match short words ("curl" would find "clavicular" and every chest press).
 * In another language the English names stay searchable: many gyms use them.
 */
const getIndex = (lang: Lang) => {
  const cached = indexes.get(lang);
  if (cached) return cached;
  const { t } = translator(lang);
  const both = (text: string) => [...new Set([t(text), text])];
  const entries: Entry[] = EXERCISES.map((e) => ({
    exercise: e,
    name: fold(t(e.name)),
    aliases: [...(lang === 'en' ? [] : [e.name]), ...e.aliases].map(fold),
    muscles: workingMuscleIds(e).flatMap((id) => both(MUSCLE_BY_ID[id].name)).map(fold),
    tags: [...categoriesOf(e).map((c) => CATEGORY_LABEL[c]), ...e.equipment.map((q) => EQUIPMENT_LABEL[q])].flatMap(both).map(fold),
  }));
  const fuse = new Fuse(entries, {
    keys: [
      { name: 'name', weight: 3 },
      { name: 'aliases', weight: 2.5 },
      { name: 'tags', weight: 0.8 },
    ],
    // Tight enough that short queries such as "RDL" stay relevant (see tests/search.test.ts).
    threshold: 0.25,
    ignoreLocation: true,
  });
  const index = { fuse, entries };
  indexes.set(lang, index);
  return index;
};

/** Name matches first, then exercises that work a muscle whose name contains the query. */
const searchPart = (part: string, lang: Lang) => {
  const { fuse, entries } = getIndex(lang);
  const q = fold(part);
  return [...fuse.search(q).map((r) => r.item), ...entries.filter((en) => en.muscles.some((n) => n.includes(q)))].map((en) => en.exercise);
};

const matchesFilters = (e: Exercise, f: ExerciseFilters) =>
  (!f.muscle || workingMuscleIds(e).includes(f.muscle)) &&
  (!f.equipment || e.equipment.includes(f.equipment)) &&
  (!f.category || categoriesOf(e).includes(f.category)) &&
  (!f.difficulty || e.difficulty === f.difficulty);

/** Splits "pull-up vs chin-up" into its parts; a plain query is one part. */
export const queryParts = (query: string) =>
  query
    .split(/\s+(?:vs\.?|versus)\s+/i)
    .map((q) => q.trim())
    .filter(Boolean);

/**
 * Fuzzy search with filters. "A vs B" puts the best match for each side first,
 * then everything else either side matched.
 */
export function searchExercises(query: string, filters: ExerciseFilters = NO_FILTERS, lang: Lang = 'en'): Exercise[] {
  const parts = queryParts(query);
  if (parts.length === 0) return EXERCISES.filter((e) => matchesFilters(e, filters));

  const perPart = parts.map((p) => searchPart(p, lang).filter((e) => matchesFilters(e, filters)));
  const ordered = [...perPart.map((hits) => hits[0]).filter(Boolean), ...perPart.flat()];
  return [...new Set(ordered)];
}
