import type { JointAction, JointId, JointMotion, MuscleId, MuscleInvolvement, MuscleRole, Phase, Side, Tier } from '../schema';

type Extra = Partial<Pick<MuscleInvolvement, 'side' | 'notes' | 'sourceIds' | 'phases'>>;

/** Shorthand for a muscle involvement: m('vastus-lateralis', 'prime', 'high', 'Extends the knee.'). */
export const m = (id: MuscleId, role: MuscleRole, tier: Tier, note: string, extra: Extra = {}): MuscleInvolvement => ({
  id,
  role,
  tier,
  note,
  ...extra,
});

/** Shorthand for a joint action. */
export const ja = (joint: JointId, motion: JointMotion, side?: Side): JointAction => ({ joint, motion, side });

/** The same role, tier and note for a group of muscles (e.g. all three vasti). */
export const group = (ids: MuscleId[], role: MuscleRole, tier: Tier, note: string, extra: Extra = {}) =>
  ids.map((id) => m(id, role, tier, note, extra));

export const VASTI: MuscleId[] = ['vastus-lateralis', 'vastus-medialis', 'vastus-intermedius'];
export const HAMSTRINGS_HIP: MuscleId[] = ['biceps-femoris-long', 'semitendinosus', 'semimembranosus'];
export const ERECTORS: MuscleId[] = ['iliocostalis', 'longissimus'];
export const ABS_BRACE: MuscleId[] = ['rectus-abdominis', 'external-oblique', 'internal-oblique', 'transversus-abdominis'];
export const GRIP: MuscleId[] = ['flexor-digitorum-superficialis', 'flexor-digitorum-profundus'];
export const TRICEPS: MuscleId[] = ['triceps-lateral', 'triceps-medial'];
export const BICEPS: MuscleId[] = ['biceps-brachii-long', 'biceps-brachii-short'];
export const RHOMBOIDS: MuscleId[] = ['rhomboid-major', 'rhomboid-minor'];
export const GASTROC: MuscleId[] = ['gastrocnemius-medial', 'gastrocnemius-lateral'];
export const OBLIQUES: MuscleId[] = ['external-oblique', 'internal-oblique'];

/** Hip, knee and ankle together: down into a squat or landing, and up out of it. */
export const TRIPLE_FLEXION: JointAction[] = [ja('hip', 'flexion'), ja('knee', 'flexion'), ja('ankle', 'dorsiflexion')];
export const TRIPLE_EXTENSION: JointAction[] = [ja('hip', 'extension'), ja('knee', 'extension'), ja('ankle', 'plantarflexion')];

/** The same joint actions, on the working limb only. */
export const working = (actions: JointAction[]): JointAction[] => actions.map((a) => ({ ...a, side: 'working' }));

/** Phase shorthands. */
export const lift = (label: string, jointActions: JointAction[]): Phase => ({ kind: 'concentric', label, jointActions });
export const lower = (label: string, jointActions: JointAction[]): Phase => ({ kind: 'eccentric', label, jointActions });
export const hold = (label: string, jointActions: JointAction[]): Phase => ({ kind: 'isometric', label, jointActions });
