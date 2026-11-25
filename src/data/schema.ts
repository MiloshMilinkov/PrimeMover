/**
 * HowWeMove data schema (draft for step 1 review).
 *
 * Exercises are data, not code. Every exercise is a typed entry that references
 * muscles, joints and motions by id. A Vitest suite (step 3) will check referential
 * integrity: unique ids, known muscle/joint/motion/source ids, at least one prime mover,
 * phases that match the motion's phase markers, and valid variation links.
 */

/* ------------------------------------------------------------------ */
/* Muscles                                                             */
/* ------------------------------------------------------------------ */

/**
 * App muscle ids are side-less. The asset pipeline maps each id to its left and
 * right meshes (pipeline/mesh-map.csv). Heads/parts of one muscle get their own id
 * so they can be coloured separately (e.g. the three deltoid heads).
 */
export const MUSCLE_IDS = [
  // Shoulder girdle and rotator cuff
  'deltoid-anterior',
  'deltoid-lateral',
  'deltoid-posterior',
  'supraspinatus',
  'infraspinatus',
  'teres-minor',
  'subscapularis',
  'teres-major',
  'trapezius-upper',
  'trapezius-middle',
  'trapezius-lower',
  'rhomboid-major',
  'rhomboid-minor',
  'levator-scapulae',
  'serratus-anterior',
  'latissimus-dorsi',
  // Chest
  'pectoralis-major-clavicular',
  'pectoralis-major-sternocostal',
  'pectoralis-major-abdominal',
  'pectoralis-minor',
  // Upper arm
  'biceps-brachii-long',
  'biceps-brachii-short',
  'brachialis',
  'coracobrachialis',
  'triceps-long',
  'triceps-lateral',
  'triceps-medial',
  'anconeus',
  // Forearm
  'brachioradialis',
  'pronator-teres',
  'flexor-carpi-radialis',
  'palmaris-longus',
  'flexor-carpi-ulnaris',
  'flexor-digitorum-superficialis',
  'flexor-digitorum-profundus',
  'flexor-pollicis-longus',
  'pronator-quadratus',
  'extensor-carpi-radialis-longus',
  'extensor-carpi-radialis-brevis',
  'extensor-carpi-ulnaris',
  'extensor-digitorum',
  'supinator',
  // Core and spine
  'rectus-abdominis',
  'external-oblique',
  'internal-oblique',
  'transversus-abdominis',
  'quadratus-lumborum',
  'iliocostalis',
  'longissimus',
  'spinalis',
  'multifidus',
  'diaphragm',
  // Neck
  'sternocleidomastoid',
  'splenius-capitis',
  'scalenes',
  // Hip
  'iliacus',
  'psoas-major',
  'gluteus-maximus',
  'gluteus-medius',
  'gluteus-minimus',
  'tensor-fasciae-latae',
  'piriformis',
  'deep-hip-rotators', // obturators, gemelli, quadratus femoris (one id, several meshes)
  'sartorius',
  // Thigh
  'rectus-femoris',
  'vastus-lateralis',
  'vastus-medialis',
  'vastus-intermedius',
  'biceps-femoris-long',
  'biceps-femoris-short',
  'semitendinosus',
  'semimembranosus',
  'adductor-magnus',
  'adductor-longus',
  'adductor-brevis',
  'pectineus',
  'gracilis',
  // Lower leg
  'gastrocnemius-medial',
  'gastrocnemius-lateral',
  'soleus',
  'popliteus',
  'tibialis-anterior',
  'tibialis-posterior',
  'fibularis-longus',
  'fibularis-brevis',
  'extensor-digitorum-longus',
  'flexor-hallucis-longus',
] as const;

export type MuscleId = (typeof MUSCLE_IDS)[number];

export type MuscleGroup =
  | 'chest'
  | 'back'
  | 'shoulders'
  | 'arms'
  | 'forearms'
  | 'core'
  | 'neck'
  | 'hips'
  | 'thighs'
  | 'lower-legs';

/** Used by the superficial / deep layer toggle. */
export type MuscleLayer = 'superficial' | 'intermediate' | 'deep';

export interface Muscle {
  id: MuscleId;
  name: string; // "Anterior deltoid"
  latinName: string; // "Pars clavicularis musculi deltoidei"
  /** Parent muscle for heads/parts, used to group them in lists ("Deltoid"). */
  parent?: string;
  group: MuscleGroup;
  layer: MuscleLayer;
  /** Which camera preset shows it best; drives auto-framing. */
  view: 'front' | 'back' | 'side';
  function: string; // one or two sentences
  origin: string;
  insertion: string;
  innervation?: string;
  jointsCrossed: JointId[];
}

/* ------------------------------------------------------------------ */
/* Joints and joint actions                                            */
/* ------------------------------------------------------------------ */

export type JointId =
  | 'cervical-spine'
  | 'thoracic-spine'
  | 'lumbar-spine'
  | 'scapulothoracic'
  | 'shoulder' // glenohumeral
  | 'elbow'
  | 'radioulnar'
  | 'wrist'
  | 'fingers'
  | 'hip'
  | 'knee'
  | 'ankle'
  | 'subtalar'
  | 'toes';

export type JointMotion =
  | 'flexion'
  | 'extension'
  | 'hyperextension'
  | 'abduction'
  | 'adduction'
  | 'horizontal-abduction'
  | 'horizontal-adduction'
  | 'internal-rotation'
  | 'external-rotation'
  | 'lateral-flexion'
  | 'rotation'
  | 'elevation'
  | 'depression'
  | 'protraction'
  | 'retraction'
  | 'upward-rotation'
  | 'downward-rotation'
  | 'pronation'
  | 'supination'
  | 'dorsiflexion'
  | 'plantarflexion'
  | 'inversion'
  | 'eversion'
  | 'anterior-pelvic-tilt'
  | 'posterior-pelvic-tilt'
  /** Joint is held still against load (anti-extension, anti-rotation, a plank). */
  | 'isometric-hold';

export interface JointAction {
  joint: JointId;
  motion: JointMotion;
  /** Relative to the exercise's working side; defaults to 'both'. */
  side?: Side;
}

/** For unilateral lifts, sides are relative to the working limb, not left/right. */
export type Side = 'both' | 'working' | 'non-working';

/* ------------------------------------------------------------------ */
/* Phases and muscle involvement                                       */
/* ------------------------------------------------------------------ */

export type PhaseKind = 'concentric' | 'eccentric' | 'isometric';

export interface Phase {
  kind: PhaseKind;
  label: string; // "Descent", "Drive up", "Lockout hold"
  jointActions: JointAction[];
}

/**
 * Role is fixed for the whole exercise and sets the legend colour + pattern.
 * 'lengthening' is for muscles whose main stimulus here is load at long length
 * (hamstrings in an RDL), not for every muscle that works eccentrically.
 */
export type MuscleRole = 'prime' | 'synergist' | 'stabilizer' | 'lengthening';

/** Activation tier from EMG / kinesiology consensus. Never a made-up percentage. */
export type Tier = 'high' | 'moderate' | 'low';

/** What the muscle is doing in a given phase. Drives pulse / flow / steady glow. */
export type ContractionMode =
  | 'shortening' // concentric
  | 'lengthening' // eccentric
  | 'isometric'
  | 'passive-stretch'
  | 'inactive';

export interface MuscleInvolvement {
  id: MuscleId;
  role: MuscleRole;
  tier: Tier;
  /** One line on what this muscle does in this lift. */
  note: string;
  side?: Side;
  /**
   * Per-phase overrides. When omitted, the mode is derived from role + phase kind:
   * prime/synergist shorten in concentric and lengthen in eccentric phases,
   * stabilizers hold isometrically, 'lengthening' muscles lengthen then shorten.
   */
  phases?: Partial<Record<PhaseKind, { mode: ContractionMode; tier?: Tier }>>;
  /** Where studies disagree: the consensus used and what the minority finding is. */
  notes?: string;
  sourceIds?: SourceId[];
}

/* ------------------------------------------------------------------ */
/* Exercise                                                            */
/* ------------------------------------------------------------------ */

export type Category =
  | 'chest'
  | 'back'
  | 'shoulders'
  | 'arms'
  | 'legs'
  | 'glutes'
  | 'core'
  | 'calisthenics'
  | 'olympic'
  | 'powerlifting'
  | 'kettlebell'
  | 'plyometric'
  | 'mobility';

export type Equipment =
  | 'bodyweight'
  | 'barbell'
  | 'ez-bar'
  | 'trap-bar'
  | 'dumbbell'
  | 'kettlebell'
  | 'cable'
  | 'machine'
  | 'smith-machine'
  | 'band'
  | 'bench'
  | 'pull-up-bar'
  | 'dip-bars'
  | 'rings'
  | 'box'
  | 'landmine'
  | 'medicine-ball'
  | 'sled';

export type Difficulty = 'beginner' | 'intermediate' | 'advanced';

export type MovementPattern =
  | 'squat'
  | 'hinge'
  | 'lunge'
  | 'horizontal-push'
  | 'vertical-push'
  | 'horizontal-pull'
  | 'vertical-pull'
  | 'carry'
  | 'rotation'
  | 'anti-rotation'
  | 'anti-extension'
  | 'trunk-flexion'
  | 'elbow-flexion'
  | 'elbow-extension'
  | 'shoulder-isolation'
  | 'hip-isolation'
  | 'knee-isolation'
  | 'ankle'
  | 'jump'
  | 'olympic'
  | 'stretch';

export interface Variation {
  /** Link to another library entry when one exists. */
  exerciseId?: string;
  name: string;
  /** "Shifts work to the clavicular pec head and anterior deltoid." */
  emphasisShift: string;
  /** Optional per-muscle direction, used by the compare overlay. */
  muscleDeltas?: { id: MuscleId; change: 'more' | 'less' }[];
}

export interface Exercise {
  /** kebab-case slug, also the URL: /exercise/barbell-back-squat */
  id: string;
  name: string;
  /** Search synonyms and abbreviations: "RDL", "skull crusher". */
  aliases: string[];
  category: Category;
  /** Extra categories for filtering (a pull-up is 'back' and 'calisthenics'). */
  alsoIn?: Category[];
  equipment: Equipment[];
  difficulty: Difficulty;
  movementPattern: MovementPattern;
  laterality: 'bilateral' | 'unilateral' | 'alternating';
  /** In playback order; must match the motion's phase markers. */
  phases: Phase[];
  muscles: MuscleInvolvement[];
  cues: string[];
  mistakes: { mistake: string; fix: string }[];
  variations: Variation[];
  animation: {
    motionId: MotionId;
    /** Motion parameters, e.g. { depth: 0.9, stance: 'wide', torsoLean: 0.3 }. */
    params?: Record<string, number | string>;
    /** Props shown with the model: bar, bench, cable stack... */
    props?: Equipment[];
  };
  camera?: { preset?: 'front' | 'back' | 'side'; focus?: MuscleId[] };
  sourceIds: SourceId[];
  notes?: string;
  /** 'draft' entries are hidden in production builds until reviewed. */
  status: 'reviewed' | 'draft';
}

/* ------------------------------------------------------------------ */
/* Motions (animation data)                                            */
/* ------------------------------------------------------------------ */

export type MotionId = string; // validated against the motion registry

/** Rotation of one rig joint in anatomical terms, in degrees. */
export interface JointPose {
  flexion?: number; // + flexion / - extension
  abduction?: number; // + abduction / - adduction
  rotation?: number; // + external / - internal (limbs), + left (spine)
}

export interface MotionKeyframe {
  /** Normalised time 0..1 within one rep. */
  t: number;
  /** Rig joint name ("hip.L", "knee.R", "spine.lumbar") -> pose. */
  pose: Record<string, JointPose>;
  /** Root (pelvis) offset in metres, for squats, jumps, lunges. */
  root?: { x?: number; y?: number; z?: number };
  ease?: 'linear' | 'in' | 'out' | 'in-out';
}

export interface Motion {
  id: MotionId;
  /** Parameters an exercise may set, with defaults. */
  params: Record<string, number | string>;
  keyframes: MotionKeyframe[];
  /** Phase segments in normalised time; kinds must match Exercise.phases. */
  phases: { kind: PhaseKind; start: number; end: number }[];
  /** IK contacts that stay planted: feet on floor, hands on bar. */
  contacts?: { effector: 'hand.L' | 'hand.R' | 'foot.L' | 'foot.R'; target: 'floor' | 'prop' }[];
  /** Seconds per rep at 1x speed. */
  duration: number;
}

/* ------------------------------------------------------------------ */
/* Sources                                                             */
/* ------------------------------------------------------------------ */

export type SourceId = string;

export interface Source {
  id: SourceId; // "escamilla-2001-squat"
  citation: string; // APA-style
  year: number;
  doi?: string;
  url?: string;
  kind: 'emg-study' | 'biomechanics-study' | 'review' | 'meta-analysis' | 'textbook' | 'position-stand';
}

/* ------------------------------------------------------------------ */
/* Workout builder                                                     */
/* ------------------------------------------------------------------ */

export interface WorkoutItem {
  exerciseId: string;
  sets: number;
  /** Sessions per week this item is done; weekly load = sets x frequency. */
  perWeek: number;
}

export interface Workout {
  id: string;
  name: string;
  items: WorkoutItem[];
}
