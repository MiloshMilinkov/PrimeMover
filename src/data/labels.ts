import type { Lang } from '../state/settings';
import type { Category, Difficulty, Equipment, Evidence, JointAction, JointId, JointMotion, MuscleGroup, PhaseKind, Side } from './schema';

export const JOINT_LABEL: Record<JointId, string> = {
  'cervical-spine': 'neck',
  'thoracic-spine': 'upper back',
  'lumbar-spine': 'lower back',
  scapulothoracic: 'shoulder blades',
  shoulder: 'shoulder',
  elbow: 'elbow',
  radioulnar: 'forearm',
  wrist: 'wrist',
  fingers: 'fingers',
  hip: 'hip',
  knee: 'knee',
  ankle: 'ankle',
  subtalar: 'subtalar joint',
  toes: 'toes',
};

export const SIDE_LABEL: Record<Side, string> = { both: '', working: 'working side', 'non-working': 'other side' };

/** Serbian joint names: nominative, genitive, and whether the noun is plural (for "miruje/miruju"). */
const JOINT_SR: Record<JointId, [string, string, boolean?]> = {
  'cervical-spine': ['vrat', 'vrata'],
  'thoracic-spine': ['gornji deo leđa', 'gornjeg dela leđa'],
  'lumbar-spine': ['donji deo leđa', 'donjeg dela leđa'],
  scapulothoracic: ['lopatice', 'lopatica', true],
  shoulder: ['rame', 'ramena'],
  elbow: ['lakat', 'lakta'],
  radioulnar: ['podlaktica', 'podlaktice'],
  wrist: ['ručni zglob', 'ručnog zgloba'],
  fingers: ['prsti', 'prstiju', true],
  hip: ['kuk', 'kuka'],
  knee: ['koleno', 'kolena'],
  ankle: ['skočni zglob', 'skočnog zgloba'],
  subtalar: ['subtalarni zglob', 'subtalarnog zgloba'],
  toes: ['prsti stopala', 'prstiju stopala', true],
};

const MOTION_SR: Record<Exclude<JointMotion, 'isometric-hold'>, string> = {
  flexion: 'fleksija',
  extension: 'ekstenzija',
  hyperextension: 'hiperekstenzija',
  abduction: 'abdukcija',
  adduction: 'adukcija',
  'horizontal-abduction': 'horizontalna abdukcija',
  'horizontal-adduction': 'horizontalna adukcija',
  'internal-rotation': 'unutrašnja rotacija',
  'external-rotation': 'spoljašnja rotacija',
  'lateral-flexion': 'bočna fleksija',
  rotation: 'rotacija',
  elevation: 'elevacija',
  depression: 'depresija',
  protraction: 'protrakcija',
  retraction: 'retrakcija',
  'upward-rotation': 'rotacija nagore',
  'downward-rotation': 'rotacija nadole',
  pronation: 'pronacija',
  supination: 'supinacija',
  dorsiflexion: 'dorzalna fleksija',
  plantarflexion: 'plantarna fleksija',
  inversion: 'inverzija',
  eversion: 'everzija',
  'anterior-pelvic-tilt': 'prednji nagib karlice',
  'posterior-pelvic-tilt': 'zadnji nagib karlice',
};
const SIDE_SR: Record<Side, string> = { both: '', working: 'radna strana', 'non-working': 'druga strana' };

/** "fleksija kuka", "donji deo leđa miruje", "zadnji nagib karlice (radna strana)". */
function jointActionTextSr(a: JointAction) {
  const [nominative, genitive, plural] = JOINT_SR[a.joint];
  const text =
    a.motion === 'isometric-hold'
      ? `${nominative} ${plural ? 'miruju' : 'miruje'}`
      : a.motion.endsWith('pelvic-tilt')
        ? MOTION_SR[a.motion]
        : `${MOTION_SR[a.motion]} ${genitive}`;
  const side = SIDE_SR[a.side ?? 'both'];
  return side ? `${text} (${side})` : text;
}

/** "hip flexion", "lower back held still", "posterior pelvic tilt (working side)". */
export function jointActionText(a: JointAction, lang: Lang = 'en') {
  if (lang === 'sr') return jointActionTextSr(a);
  const motion = a.motion.replaceAll('-', ' ');
  const text =
    a.motion === 'isometric-hold'
      ? `${JOINT_LABEL[a.joint]} held still`
      : a.motion.endsWith('pelvic-tilt')
        ? motion
        : `${JOINT_LABEL[a.joint]} ${motion}`;
  const side = SIDE_LABEL[a.side ?? 'both'];
  return side ? `${text} (${side})` : text;
}

export const CATEGORY_LABEL: Record<Category, string> = {
  chest: 'Chest',
  back: 'Back',
  shoulders: 'Shoulders',
  arms: 'Arms',
  legs: 'Legs',
  glutes: 'Glutes',
  core: 'Core',
  calisthenics: 'Calisthenics',
  olympic: 'Olympic lifts',
  powerlifting: 'Powerlifting',
  kettlebell: 'Kettlebell',
  plyometric: 'Plyometrics',
  mobility: 'Mobility',
};

export const EQUIPMENT_LABEL: Record<Equipment, string> = {
  bodyweight: 'Bodyweight',
  barbell: 'Barbell',
  'ez-bar': 'EZ-bar',
  'trap-bar': 'Trap bar',
  dumbbell: 'Dumbbell',
  kettlebell: 'Kettlebell',
  cable: 'Cable',
  machine: 'Machine',
  'smith-machine': 'Smith machine',
  band: 'Band',
  bench: 'Bench',
  'pull-up-bar': 'Pull-up bar',
  'dip-bars': 'Dip bars',
  rings: 'Rings',
  box: 'Box',
  landmine: 'Landmine',
  'medicine-ball': 'Medicine ball',
  sled: 'Sled',
};

export const DIFFICULTY_LABEL: Record<Difficulty, string> = {
  beginner: 'Beginner',
  intermediate: 'Intermediate',
  advanced: 'Advanced',
};

export const MUSCLE_GROUP_LABEL: Record<MuscleGroup, string> = {
  chest: 'Chest',
  back: 'Back',
  shoulders: 'Shoulders',
  arms: 'Upper arms',
  forearms: 'Forearms',
  core: 'Core',
  neck: 'Neck',
  hips: 'Hips and glutes',
  thighs: 'Thighs',
  'lower-legs': 'Lower legs',
};

export const MUSCLE_GROUP_ORDER: MuscleGroup[] = ['chest', 'shoulders', 'back', 'arms', 'forearms', 'core', 'neck', 'hips', 'thighs', 'lower-legs'];

/** Plain-language name for each contraction phase. */
export const PHASE_KIND_LABEL: Record<PhaseKind, string> = {
  concentric: 'Lifting (concentric)',
  eccentric: 'Lowering (eccentric)',
  isometric: 'Holding (isometric)',
};

/** How the muscle roles of an exercise were established. */
export const EVIDENCE_LABEL: Record<Evidence, { title: string; badge: string; detail: string }> = {
  emg: { title: 'Measured', badge: 'EMG measured', detail: 'EMG studies recorded these muscles during this exercise.' },
  related: { title: 'From related studies', badge: 'Related studies', detail: 'Based on EMG of close variations or the same movement, plus anatomy.' },
  anatomy: { title: 'From anatomy', badge: 'From anatomy', detail: 'No direct EMG found; roles follow from the joint actions and muscle anatomy.' },
};
