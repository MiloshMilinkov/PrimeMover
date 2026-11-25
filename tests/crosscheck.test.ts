/**
 * Optional cross-check of our muscle roles against free-exercise-db
 * (https://github.com/yuhonas/free-exercise-db, Unlicense). That dataset is coarse
 * (17 muscle groups, editorial rather than EMG-based) and is never shipped; it only
 * flags entries worth a second look. Every flag must be either fixed in the data or
 * listed in ACCEPTED with the reason we disagree. See docs/02-activation-evidence.md.
 *
 *   FREE_EXERCISE_DB=path/to/exercises.json npx vitest run tests/crosscheck.test.ts
 */
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { EXERCISES } from '../src/data/exercises';
import type { Exercise, MuscleId } from '../src/data/schema';

const DB_PATH = process.env.FREE_EXERCISE_DB;

type Group =
  | 'abdominals' | 'abductors' | 'adductors' | 'biceps' | 'calves' | 'chest' | 'forearms' | 'glutes' | 'hamstrings'
  | 'lats' | 'lower back' | 'middle back' | 'neck' | 'quadriceps' | 'shoulders' | 'traps' | 'triceps';

interface DbExercise {
  name: string;
  primaryMuscles: Group[];
  secondaryMuscles: Group[];
}

/** Our muscles inside each of their groups. */
const GROUPS: Record<Group, MuscleId[]> = {
  abdominals: ['rectus-abdominis', 'external-oblique', 'internal-oblique', 'transversus-abdominis'],
  abductors: ['gluteus-medius', 'gluteus-minimus', 'tensor-fasciae-latae'],
  adductors: ['adductor-magnus', 'adductor-longus', 'adductor-brevis', 'pectineus', 'gracilis'],
  biceps: ['biceps-brachii-long', 'biceps-brachii-short', 'brachialis'],
  calves: ['gastrocnemius-medial', 'gastrocnemius-lateral', 'soleus'],
  chest: ['pectoralis-major-clavicular', 'pectoralis-major-sternocostal', 'pectoralis-major-abdominal', 'pectoralis-minor'],
  forearms: [
    'brachioradialis', 'pronator-teres', 'flexor-carpi-radialis', 'palmaris-longus', 'flexor-carpi-ulnaris',
    'flexor-digitorum-superficialis', 'flexor-digitorum-profundus', 'flexor-pollicis-longus', 'pronator-quadratus',
    'extensor-carpi-radialis-longus', 'extensor-carpi-radialis-brevis', 'extensor-carpi-ulnaris', 'extensor-digitorum', 'supinator',
  ],
  glutes: ['gluteus-maximus', 'gluteus-medius', 'gluteus-minimus', 'piriformis', 'deep-hip-rotators'],
  hamstrings: ['biceps-femoris-long', 'biceps-femoris-short', 'semitendinosus', 'semimembranosus'],
  lats: ['latissimus-dorsi', 'teres-major'],
  'lower back': ['iliocostalis', 'longissimus', 'spinalis', 'multifidus', 'quadratus-lumborum'],
  'middle back': ['trapezius-middle', 'trapezius-lower', 'rhomboid-major', 'rhomboid-minor'],
  neck: ['sternocleidomastoid', 'splenius-capitis', 'scalenes', 'levator-scapulae'],
  quadriceps: ['vastus-lateralis', 'vastus-medialis', 'vastus-intermedius', 'rectus-femoris'],
  shoulders: ['deltoid-anterior', 'deltoid-lateral', 'deltoid-posterior', 'supraspinatus', 'infraspinatus', 'teres-minor', 'subscapularis'],
  traps: ['trapezius-upper', 'trapezius-middle', 'trapezius-lower'],
  triceps: ['triceps-long', 'triceps-lateral', 'triceps-medial', 'anconeus'],
};

/** Their name for ours where the names differ; null where they have no counterpart. */
const NAME: Partial<Record<string, string | null>> = {
  'barbell-back-squat': 'Barbell Full Squat',
  'barbell-front-squat': 'Front Barbell Squat',
  'bulgarian-split-squat': 'Split Squat with Dumbbells',
  'lying-leg-curl': 'Lying Leg Curls',
  'stiff-leg-deadlift': 'Stiff-Legged Barbell Deadlift',
  'single-leg-romanian-deadlift': 'Kettlebell One-Legged Deadlift',
  'back-extension': 'Hyperextensions (Back Extensions)',
  'walking-lunge': 'Barbell Walking Lunge',
  'reverse-lunge': 'Dumbbell Rear Lunge',
  'step-up': 'Dumbbell Step Ups',
  'pistol-squat': 'Kettlebell Pistol Squat',
  'nordic-hamstring-curl': 'Natural Glute Ham Raise',
  'glute-bridge': 'Butt Lift (Bridge)',
  'hip-abduction-machine': 'Thigh Abductor',
  'hip-adduction-machine': 'Thigh Adductor',
  'side-lying-hip-abduction': 'Side Leg Raises',
  'barbell-bench-press': 'Barbell Bench Press - Medium Grip',
  'push-up': 'Pushups',
  'pull-up': 'Pullups',
  'lat-pulldown': 'Wide-Grip Lat Pulldown',
  'barbell-bent-over-row': 'Bent Over Barbell Row',
  'seated-cable-row': 'Seated Cable Rows',
  'overhead-press': 'Standing Military Press',
  'hammer-curl': 'Hammer Curls',
  'lying-triceps-extension': 'EZ-Bar Skullcrusher',
  'incline-barbell-bench-press': 'Barbell Incline Bench Press - Medium Grip',
  'decline-bench-press': 'Decline Barbell Bench Press',
  'close-grip-bench-press': 'Close-Grip Barbell Bench Press',
  'dumbbell-fly': 'Dumbbell Flyes',
  'pec-deck': 'Butterfly',
  'machine-chest-press': 'Machine Bench Press',
  't-bar-row': 'Bent Over Two-Arm Long Bar Row',
  'chest-supported-row': 'Dumbbell Incline Row',
  'front-raise': 'Front Dumbbell Raise',
  'reverse-dumbbell-fly': 'Seated Bent-Over Rear Delt Raise',
  'upright-row': 'Upright Barbell Row',
  'cable-lateral-raise': 'Cable Seated Lateral Raise',
  'dumbbell-curl': 'Dumbbell Bicep Curl',
  'concentration-curl': 'Concentration Curls',
  'cable-curl': 'Standing Biceps Cable Curl',
  'reverse-curl': 'Reverse Barbell Curl',
  'wrist-curl': 'Palms-Up Barbell Wrist Curl Over A Bench',
  'reverse-wrist-curl': 'Palms-Down Wrist Curl Over A Bench',
  'overhead-triceps-extension': 'Cable Rope Overhead Triceps Extension',
  'triceps-kickback': 'Tricep Dumbbell Kickback',
  'kettlebell-swing': 'One-Arm Kettlebell Swings',
  crunch: 'Crunches',
  'bicycle-crunch': 'Air Bike',
  'cable-woodchop': 'Standing Cable Wood Chop',
  'lying-leg-raise': 'Flat Bench Lying Leg Raise',
  thruster: 'Kettlebell Thruster',
  'box-jump': 'Front Box Jump',
  'jump-squat': 'Freehand Jump Squat',
  'turkish-get-up': 'Kettlebell Turkish Get-Up (Lunge style)',
  'handstand-push-up': 'Handstand Push-Ups',
  'diamond-push-up': 'Push-Ups - Close Triceps Position',
  'kneeling-hip-flexor-stretch': 'Kneeling Hip Flexor',
  'wall-calf-stretch': 'Calf Stretch Hands Against Wall',
  'cat-cow': 'Cat Stretch',
  'landmine-press': null,
  'prone-y-raise': null,
  'bird-dog': null,
  'l-sit': null,
  'suitcase-carry': null,
  burpee: null,
  'pigeon-stretch': null,
  'doorway-pec-stretch': null,
  'wall-sit': null,
  clamshell: null,
  'pike-push-up': null,
};

/**
 * Flags we reviewed and disagree with, keyed "exercise-id kind:ref":
 * - their-primary:<group>: a group they call primary has none of our moving or stretched muscles;
 * - our-prime:<muscle>: one of our high-tier prime (or most-stretched) muscles is in no group they list.
 */
const ACCEPTED: Record<string, string> = {
  'conventional-deadlift their-primary:lower back':
    'The erectors work hard but isometrically, holding the spine rigid; we show them as high-tier stabilizers.',
  'side-lying-hip-abduction their-primary:adductors':
    'Their entry describes raising the leg out to the side, which is abduction; "adductors" looks like a labelling slip.',
  'side-lying-hip-abduction our-prime:gluteus-medius':
    'Same slip. Distefano 2009 measured the highest gluteus medius activity of all exercises in side-lying abduction.',
  'hammer-curl our-prime:brachioradialis':
    'They list biceps only. The brachioradialis is strongest with a neutral grip (Kleiber 2015).',
  'side-plank our-prime:quadratus-lumborum':
    'Their groups have no quadratus lumborum; it holds the pelvis up on the bottom side (Neumann 2017).',
  'mountain-climber our-prime:rectus-abdominis':
    'They treat it as a leg drill. We treat it as a moving plank, where the abdominals hold the trunk, as in the plank.',
  'lying-leg-raise their-primary:abdominals':
    'The hip flexors lift the legs; the rectus abdominis holds the pelvis still. We show it as a high-tier stabilizer and explain this in the notes.',
  'thruster our-prime:gluteus-maximus':
    'Their kettlebell version lists shoulders and quadriceps; the full squat in a thruster loads the glutes as a squat does (Contreras 2016).',
  'childs-pose our-prime:latissimus-dorsi':
    'They list the back muscles the pose stretches; reaching the arms overhead also lengthens the lats (Neumann 2017).',
};

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();

function flagsFor(e: Exercise, d: DbExercise): string[] {
  const ours = new Set(e.muscles.filter((m) => m.role !== 'stabilizer').map((m) => m.id));
  const primes = e.muscles.filter((m) => (m.role === 'prime' || m.role === 'lengthening') && m.tier === 'high').map((m) => m.id);
  const theirs = new Set([...d.primaryMuscles, ...d.secondaryMuscles]);
  const groupsOf = (id: MuscleId) => (Object.keys(GROUPS) as Group[]).filter((g) => GROUPS[g].includes(id));
  return [
    ...d.primaryMuscles.filter((g) => !GROUPS[g].some((id) => ours.has(id))).map((g) => `their-primary:${g}`),
    ...primes.filter((id) => groupsOf(id).length && !groupsOf(id).some((g) => theirs.has(g))).map((id) => `our-prime:${id}`),
  ].map((f) => `${e.id} ${f}`);
}

describe.skipIf(!DB_PATH)('cross-check against free-exercise-db', () => {
  // Vitest still runs a skipped describe body to collect its tests, so only read the file when given.
  const db = (DB_PATH ? JSON.parse(readFileSync(DB_PATH, 'utf8')) : []) as DbExercise[];
  const byName = new Map(db.map((d) => [norm(d.name), d]));
  /** Their entry, null where we marked it as missing there, undefined where nothing matched. */
  const find = (e: Exercise): DbExercise | null | undefined => {
    const name = NAME[e.id];
    if (name === null) return null;
    return [name ?? e.name, ...(name ? [] : e.aliases)].map((n) => byName.get(norm(n))).find(Boolean);
  };
  const flags = EXERCISES.flatMap((e) => {
    const d = find(e);
    return d ? flagsFor(e, d) : [];
  });
  if (process.env.CROSSCHECK_REPORT) console.log(flags.join('\n'));

  it('maps every exercise to theirs or marks it as missing there', () => {
    expect(EXERCISES.filter((e) => find(e) === undefined).map((e) => e.id)).toEqual([]);
  });

  it('has no unreviewed disagreements', () => {
    expect(flags.filter((f) => !(f in ACCEPTED))).toEqual([]);
  });

  it('has no stale accepted entries', () => {
    expect(Object.keys(ACCEPTED).filter((k) => !flags.includes(k))).toEqual([]);
  });
});
