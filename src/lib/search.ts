import Fuse from 'fuse.js/basic';
import { categoriesOf, EXERCISES, workingMuscleIds } from '../data/exercises';
import { CATEGORY_LABEL, EQUIPMENT_LABEL } from '../data/labels';
import { MUSCLE_BY_ID } from '../data/muscles';
import type { Category, Difficulty, Equipment, Exercise, MuscleId } from '../data/schema';

export interface ExerciseFilters {
  muscle: MuscleId | null;
  equipment: Equipment | null;
  category: Category | null;
  difficulty: Difficulty | null;
}

export const NO_FILTERS: ExerciseFilters = { muscle: null, equipment: null, category: null, difficulty: null };

type Entry = { exercise: Exercise; name: string; aliases: string[]; muscles: string[]; tags: string[] };
let index: Fuse<Entry> | null = null;

/** Built on the first search: names first, then the muscles each exercise works. */
const getIndex = () =>
  (index ??= new Fuse(
    EXERCISES.map((e) => ({
      exercise: e,
      name: e.name,
      aliases: e.aliases,
      muscles: workingMuscleIds(e).map((id) => MUSCLE_BY_ID[id].name),
      tags: [...categoriesOf(e).map((c) => CATEGORY_LABEL[c]), ...e.equipment.map((q) => EQUIPMENT_LABEL[q])],
    })),
    {
      keys: [
        { name: 'name', weight: 3 },
        { name: 'aliases', weight: 2.5 },
        { name: 'muscles', weight: 1 },
        { name: 'tags', weight: 0.8 },
      ],
      // Tight enough that short queries such as "RDL" stay relevant (see tests/search.test.ts).
      threshold: 0.25,
      ignoreLocation: true,
    },
  ));

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
export function searchExercises(query: string, filters: ExerciseFilters = NO_FILTERS): Exercise[] {
  const parts = queryParts(query);
  if (parts.length === 0) return EXERCISES.filter((e) => matchesFilters(e, filters));

  const perPart = parts.map((p) => getIndex().search(p).map((r) => r.item.exercise).filter((e) => matchesFilters(e, filters)));
  const ordered = [...perPart.map((hits) => hits[0]).filter(Boolean), ...perPart.flat()];
  return [...new Set(ordered)];
}
