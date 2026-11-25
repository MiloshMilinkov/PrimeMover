import type { Category, Exercise, MuscleId } from '../schema';
import { BACK } from './back';
import { CHEST } from './chest';
import { LEGS } from './legs';
import { LOWER_BODY } from './lower-body';
import { MOBILITY } from './mobility';
import { POWER } from './power';
import { TRUNK } from './trunk';
import { UPPER_BODY } from './upper-body';
import { CORE, UPPER } from './upper';

/** All exercises shown in the library ('draft' entries are hidden in production). */
export const EXERCISES: Exercise[] = [
  ...LEGS,
  ...LOWER_BODY,
  ...CHEST,
  ...BACK,
  ...UPPER,
  ...UPPER_BODY,
  ...CORE,
  ...TRUNK,
  ...POWER,
  ...MOBILITY,
].filter(
  (e) => e.status === 'reviewed' || import.meta.env.DEV,
);

export const EXERCISE_BY_ID: Record<string, Exercise> = Object.fromEntries(EXERCISES.map((e) => [e.id, e]));

/** Muscles that move or resist the load (everything but stabilizers). */
export const workingMuscleIds = (e: Exercise): MuscleId[] => e.muscles.filter((m) => m.role !== 'stabilizer').map((m) => m.id);

/** The muscles the camera frames when the exercise opens. */
export const framingIds = (e: Exercise): MuscleId[] => e.camera?.focus ?? workingMuscleIds(e);

export const categoriesOf = (e: Exercise): Category[] => [e.category, ...(e.alsoIn ?? [])];

/** Path to an exercise, optionally with one of its muscles in focus. */
export const exercisePath = (id: string, muscle?: MuscleId | null) => `/exercise/${id}${muscle ? `?m=${muscle}` : ''}`;
