import type { Exercise, MuscleId, MuscleInvolvement, Side } from '../data/schema';
import type { ModelSide } from '../state/viewer';
import { SIDE_PRESET_FACES } from '../three/camera';

/** One-sided lifts work the limb the side view shows. */
export const WORKING_SIDE = SIDE_PRESET_FACES as Exclude<ModelSide, 'center'>;
const OTHER_SIDE = WORKING_SIDE === 'left' ? 'right' : 'left';

/** Model sides an involvement covers. */
const MODEL_SIDES: Record<Side, ModelSide[]> = {
  both: ['left', 'right', 'center'],
  working: [WORKING_SIDE],
  'non-working': [OTHER_SIDE],
};

/** Muscle id + model side -> what that muscle does in the exercise. */
export type InvolvementMap = Map<string, MuscleInvolvement>;

export const involvementKey = (id: MuscleId, side: ModelSide) => `${id}:${side}`;

const cache = new WeakMap<Exercise, InvolvementMap>();

/** The exercise's involvement per muscle and model side, built once per exercise. */
export function involvementFor(exercise: Exercise): InvolvementMap {
  let map = cache.get(exercise);
  if (!map) {
    map = new Map();
    for (const m of exercise.muscles) for (const side of MODEL_SIDES[m.side ?? 'both']) map.set(involvementKey(m.id, side), m);
    cache.set(exercise, map);
  }
  return map;
}
