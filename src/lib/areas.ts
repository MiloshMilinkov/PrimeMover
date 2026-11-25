import { MUSCLE_GROUP_LABEL } from '../data/labels';
import { MUSCLE_BY_ID } from '../data/muscles';
import { MUSCLE_IDS, type Exercise, type MuscleId, type MuscleRole } from '../data/schema';

/** Gym-floor names for muscles, so a client reads "quads" rather than "vastus lateralis". First match wins. */
const AREA_RULES: [RegExp, string][] = [
  [/^(vastus-|rectus-femoris)/, 'quads'],
  [/^(biceps-femoris|semitendinosus|semimembranosus)/, 'hamstrings'],
  [/^(adductor-|pectineus|gracilis)/, 'inner thighs'],
  [/^(gluteus-|piriformis|deep-hip-rotators|tensor-fasciae-latae)/, 'glutes'],
  [/^(iliacus|psoas-major|sartorius)/, 'hip flexors'],
  [/^(gastrocnemius|soleus)/, 'calves'],
  [/^(tibialis-|fibularis-|popliteus|extensor-digitorum-longus|flexor-hallucis-longus)/, 'shins'],
  [/^pectoralis-/, 'chest'],
  [/^deltoid-anterior/, 'front shoulders'],
  [/^deltoid-lateral/, 'side shoulders'],
  [/^deltoid-posterior/, 'rear shoulders'],
  [/^(supraspinatus|infraspinatus|teres-minor|subscapularis)/, 'rotator cuff'],
  [/^(latissimus-dorsi|teres-major)/, 'lats'],
  [/^(trapezius-|rhomboid-|levator-scapulae)/, 'upper back'],
  [/^serratus-anterior/, 'serratus'],
  [/^(biceps-brachii|brachialis|coracobrachialis)/, 'biceps'],
  [/^(triceps-|anconeus)/, 'triceps'],
  [/^rectus-abdominis/, 'abs'],
  [/^(external-oblique|internal-oblique)/, 'obliques'],
  [/^transversus-abdominis/, 'deep core'],
  [/^(iliocostalis|longissimus|spinalis|multifidus|quadratus-lumborum)/, 'lower back'],
];

/** Worked out once per muscle; anything the table misses falls back to its region ("forearms", "neck"). */
const AREA_BY_ID = Object.fromEntries(
  MUSCLE_IDS.map((id) => [id, AREA_RULES.find(([re]) => re.test(id))?.[1] ?? MUSCLE_GROUP_LABEL[MUSCLE_BY_ID[id].group].toLowerCase()]),
) as Record<MuscleId, string>;

export const areaOf = (id: MuscleId) => AREA_BY_ID[id];

/** Distinct areas of an exercise's muscles in one role, in the order the data lists them. */
export const areasFor = (e: Exercise, role: MuscleRole) => [...new Set(e.muscles.filter((m) => m.role === role).map((m) => areaOf(m.id)))];

/** The areas that drive the exercise: prime movers, or for a stretch the muscles it lengthens most. */
export const mainAreas = (e: Exercise) => {
  const prime = areasFor(e, 'prime');
  return prime.length ? prime : areasFor(e, 'lengthening');
};
