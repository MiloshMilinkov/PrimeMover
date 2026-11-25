import type { Muscle, MuscleId } from './schema';

type MuscleData = Omit<Muscle, 'id'>;

/**
 * Muscle registry. Keyed by MuscleId, so TypeScript fails the build if any id
 * in MUSCLE_IDS is missing here. Origins and insertions follow standard
 * anatomy references (Gray's Anatomy, Netter); wording is simplified.
 */
const DATA: Record<MuscleId, MuscleData> = {
  /* ---------------- Shoulder girdle and rotator cuff ---------------- */
  'deltoid-anterior': {
    name: 'Anterior deltoid', latinName: 'Deltoideus, pars clavicularis', parent: 'Deltoid',
    group: 'shoulders', layer: 'superficial', view: 'front', jointsCrossed: ['shoulder'],
    function: 'Flexes and internally rotates the arm and helps bring it across the body, as in pressing.',
    origin: 'Lateral third of the clavicle.', insertion: 'Deltoid tuberosity of the humerus.',
  },
  'deltoid-lateral': {
    name: 'Lateral deltoid', latinName: 'Deltoideus, pars acromialis', parent: 'Deltoid',
    group: 'shoulders', layer: 'superficial', view: 'side', jointsCrossed: ['shoulder'],
    function: 'Abducts the arm, raising it out to the side from about 15° up to overhead.',
    origin: 'Acromion of the scapula.', insertion: 'Deltoid tuberosity of the humerus.',
  },
  'deltoid-posterior': {
    name: 'Posterior deltoid', latinName: 'Deltoideus, pars spinalis', parent: 'Deltoid',
    group: 'shoulders', layer: 'superficial', view: 'back', jointsCrossed: ['shoulder'],
    function: 'Extends, horizontally abducts and externally rotates the arm, as in rows and reverse flyes.',
    origin: 'Spine of the scapula.', insertion: 'Deltoid tuberosity of the humerus.',
  },
  supraspinatus: {
    name: 'Supraspinatus', latinName: 'Musculus supraspinatus', parent: 'Rotator cuff',
    group: 'shoulders', layer: 'deep', view: 'back', jointsCrossed: ['shoulder'],
    function: 'Starts arm abduction and holds the head of the humerus centred in the socket.',
    origin: 'Supraspinous fossa of the scapula.', insertion: 'Upper facet of the greater tubercle of the humerus.',
  },
  infraspinatus: {
    name: 'Infraspinatus', latinName: 'Musculus infraspinatus', parent: 'Rotator cuff',
    group: 'shoulders', layer: 'intermediate', view: 'back', jointsCrossed: ['shoulder'],
    function: 'The main external rotator of the arm; steadies the humeral head during pressing and pulling.',
    origin: 'Infraspinous fossa of the scapula.', insertion: 'Middle facet of the greater tubercle of the humerus.',
  },
  'teres-minor': {
    name: 'Teres minor', latinName: 'Musculus teres minor', parent: 'Rotator cuff',
    group: 'shoulders', layer: 'intermediate', view: 'back', jointsCrossed: ['shoulder'],
    function: 'Externally rotates the arm and stabilises the shoulder joint.',
    origin: 'Upper two-thirds of the lateral border of the scapula.', insertion: 'Lower facet of the greater tubercle of the humerus.',
  },
  subscapularis: {
    name: 'Subscapularis', latinName: 'Musculus subscapularis', parent: 'Rotator cuff',
    group: 'shoulders', layer: 'deep', view: 'front', jointsCrossed: ['shoulder'],
    function: 'Internally rotates the arm; the front wall of the rotator cuff.',
    origin: 'Subscapular fossa, on the front of the scapula.', insertion: 'Lesser tubercle of the humerus.',
  },
  'teres-major': {
    name: 'Teres major', latinName: 'Musculus teres major',
    group: 'back', layer: 'intermediate', view: 'back', jointsCrossed: ['shoulder'],
    function: 'Extends, adducts and internally rotates the arm, working alongside the lats.',
    origin: 'Back of the inferior angle of the scapula.', insertion: 'Medial lip of the intertubercular groove of the humerus.',
  },
  'trapezius-upper': {
    name: 'Upper trapezius', latinName: 'Trapezius, pars descendens', parent: 'Trapezius',
    group: 'back', layer: 'superficial', view: 'back', jointsCrossed: ['scapulothoracic', 'cervical-spine'],
    function: 'Elevates and upwardly rotates the scapula; extends and side-bends the neck.',
    origin: 'External occipital protuberance, superior nuchal line and nuchal ligament.', insertion: 'Lateral third of the clavicle.',
  },
  'trapezius-middle': {
    name: 'Middle trapezius', latinName: 'Trapezius, pars transversa', parent: 'Trapezius',
    group: 'back', layer: 'superficial', view: 'back', jointsCrossed: ['scapulothoracic'],
    function: 'Retracts the scapula, squeezing the shoulder blades together.',
    origin: 'Spinous processes of C7–T3.', insertion: 'Acromion and upper border of the spine of the scapula.',
  },
  'trapezius-lower': {
    name: 'Lower trapezius', latinName: 'Trapezius, pars ascendens', parent: 'Trapezius',
    group: 'back', layer: 'superficial', view: 'back', jointsCrossed: ['scapulothoracic'],
    function: 'Depresses and upwardly rotates the scapula; key for healthy overhead pressing.',
    origin: 'Spinous processes of T4–T12.', insertion: 'Medial end of the spine of the scapula.',
  },
  'rhomboid-major': {
    name: 'Rhomboid major', latinName: 'Musculus rhomboideus major', parent: 'Rhomboids',
    group: 'back', layer: 'intermediate', view: 'back', jointsCrossed: ['scapulothoracic'],
    function: 'Retracts and downwardly rotates the scapula.',
    origin: 'Spinous processes of T2–T5.', insertion: 'Medial border of the scapula below the spine.',
  },
  'rhomboid-minor': {
    name: 'Rhomboid minor', latinName: 'Musculus rhomboideus minor', parent: 'Rhomboids',
    group: 'back', layer: 'intermediate', view: 'back', jointsCrossed: ['scapulothoracic'],
    function: 'Retracts and downwardly rotates the scapula.',
    origin: 'Nuchal ligament and spinous processes of C7–T1.', insertion: 'Medial border of the scapula at the root of the spine.',
  },
  'levator-scapulae': {
    name: 'Levator scapulae', latinName: 'Musculus levator scapulae',
    group: 'back', layer: 'intermediate', view: 'back', jointsCrossed: ['scapulothoracic', 'cervical-spine'],
    function: 'Elevates the scapula and tilts it downward; side-bends the neck.',
    origin: 'Transverse processes of C1–C4.', insertion: 'Superior angle and upper medial border of the scapula.',
  },
  'serratus-anterior': {
    name: 'Serratus anterior', latinName: 'Musculus serratus anterior',
    group: 'chest', layer: 'intermediate', view: 'side', jointsCrossed: ['scapulothoracic'],
    function: 'Protracts and upwardly rotates the scapula and keeps it flat against the ribs, preventing winging.',
    origin: 'Outer surfaces of ribs 1–8.', insertion: 'Front of the medial border of the scapula.',
  },
  'latissimus-dorsi': {
    name: 'Latissimus dorsi', latinName: 'Musculus latissimus dorsi',
    group: 'back', layer: 'superficial', view: 'back', jointsCrossed: ['shoulder', 'thoracic-spine', 'lumbar-spine'],
    function: 'Extends, adducts and internally rotates the arm; pulls the body up to a bar.',
    origin: 'Spinous processes of T7–L5 via the thoracolumbar fascia, posterior iliac crest and lower three or four ribs.',
    insertion: 'Floor of the intertubercular groove of the humerus.',
  },

  /* ---------------- Chest ---------------- */
  'pectoralis-major-clavicular': {
    name: 'Upper chest (clavicular pec)', latinName: 'Pectoralis major, pars clavicularis', parent: 'Pectoralis major',
    group: 'chest', layer: 'superficial', view: 'front', jointsCrossed: ['shoulder'],
    function: 'Flexes the arm and brings it across the body; works hardest in incline pressing.',
    origin: 'Medial half of the clavicle.', insertion: 'Lateral lip of the intertubercular groove of the humerus.',
  },
  'pectoralis-major-sternocostal': {
    name: 'Mid chest (sternocostal pec)', latinName: 'Pectoralis major, pars sternocostalis', parent: 'Pectoralis major',
    group: 'chest', layer: 'superficial', view: 'front', jointsCrossed: ['shoulder'],
    function: 'Brings the arm across the body and internally rotates it; the main chest driver in flat pressing.',
    origin: 'Front of the sternum and cartilages of ribs 1–6.', insertion: 'Lateral lip of the intertubercular groove of the humerus.',
  },
  'pectoralis-major-abdominal': {
    name: 'Lower chest (abdominal pec)', latinName: 'Pectoralis major, pars abdominalis', parent: 'Pectoralis major',
    group: 'chest', layer: 'superficial', view: 'front', jointsCrossed: ['shoulder'],
    function: 'Pulls the arm down and across from a raised position, as in dips and decline pressing.',
    origin: 'Aponeurosis of the external oblique (front of the rectus sheath).', insertion: 'Lateral lip of the intertubercular groove of the humerus.',
  },
  'pectoralis-minor': {
    name: 'Pectoralis minor', latinName: 'Musculus pectoralis minor',
    group: 'chest', layer: 'deep', view: 'front', jointsCrossed: ['scapulothoracic'],
    function: 'Pulls the scapula forward and down; assists forced breathing.',
    origin: 'Ribs 3–5 near their cartilages.', insertion: 'Coracoid process of the scapula.',
  },

  /* ---------------- Upper arm ---------------- */
  'biceps-brachii-long': {
    name: 'Biceps, long head', latinName: 'Biceps brachii, caput longum', parent: 'Biceps brachii',
    group: 'arms', layer: 'superficial', view: 'front', jointsCrossed: ['shoulder', 'elbow', 'radioulnar'],
    function: 'Flexes the elbow and supinates the forearm; most stretched with the arm behind the body.',
    origin: 'Supraglenoid tubercle of the scapula.', insertion: 'Radial tuberosity and bicipital aponeurosis.',
  },
  'biceps-brachii-short': {
    name: 'Biceps, short head', latinName: 'Biceps brachii, caput breve', parent: 'Biceps brachii',
    group: 'arms', layer: 'superficial', view: 'front', jointsCrossed: ['shoulder', 'elbow', 'radioulnar'],
    function: 'Flexes the elbow and supinates the forearm; helps flex and adduct the shoulder.',
    origin: 'Coracoid process of the scapula.', insertion: 'Radial tuberosity and bicipital aponeurosis.',
  },
  brachialis: {
    name: 'Brachialis', latinName: 'Musculus brachialis',
    group: 'arms', layer: 'intermediate', view: 'side', jointsCrossed: ['elbow'],
    function: 'A pure elbow flexor that works in every grip; the strongest elbow flexor.',
    origin: 'Lower half of the front of the humerus.', insertion: 'Coronoid process and tuberosity of the ulna.',
  },
  coracobrachialis: {
    name: 'Coracobrachialis', latinName: 'Musculus coracobrachialis',
    group: 'arms', layer: 'deep', view: 'front', jointsCrossed: ['shoulder'],
    function: 'Flexes and adducts the arm at the shoulder.',
    origin: 'Coracoid process of the scapula.', insertion: 'Middle of the medial shaft of the humerus.',
  },
  'triceps-long': {
    name: 'Triceps, long head', latinName: 'Triceps brachii, caput longum', parent: 'Triceps brachii',
    group: 'arms', layer: 'superficial', view: 'back', jointsCrossed: ['shoulder', 'elbow'],
    function: 'Extends the elbow and helps extend the shoulder; most stretched with the arm overhead.',
    origin: 'Infraglenoid tubercle of the scapula.', insertion: 'Olecranon of the ulna.',
  },
  'triceps-lateral': {
    name: 'Triceps, lateral head', latinName: 'Triceps brachii, caput laterale', parent: 'Triceps brachii',
    group: 'arms', layer: 'superficial', view: 'back', jointsCrossed: ['elbow'],
    function: 'Extends the elbow; recruited heavily in hard pressing.',
    origin: 'Back of the humerus above the radial groove.', insertion: 'Olecranon of the ulna.',
  },
  'triceps-medial': {
    name: 'Triceps, medial head', latinName: 'Triceps brachii, caput mediale', parent: 'Triceps brachii',
    group: 'arms', layer: 'intermediate', view: 'back', jointsCrossed: ['elbow'],
    function: 'Extends the elbow in every position and is active even at light loads.',
    origin: 'Back of the humerus below the radial groove.', insertion: 'Olecranon of the ulna.',
  },
  anconeus: {
    name: 'Anconeus', latinName: 'Musculus anconeus',
    group: 'arms', layer: 'superficial', view: 'back', jointsCrossed: ['elbow'],
    function: 'Assists elbow extension and steadies the elbow joint.',
    origin: 'Lateral epicondyle of the humerus.', insertion: 'Side of the olecranon and upper back of the ulna.',
  },

  /* ---------------- Forearm ---------------- */
  brachioradialis: {
    name: 'Brachioradialis', latinName: 'Musculus brachioradialis',
    group: 'forearms', layer: 'superficial', view: 'side', jointsCrossed: ['elbow'],
    function: 'Flexes the elbow, strongest with a neutral (hammer) grip.',
    origin: 'Lateral supracondylar ridge of the humerus.', insertion: 'Styloid process of the radius.',
  },
  'pronator-teres': {
    name: 'Pronator teres', latinName: 'Musculus pronator teres',
    group: 'forearms', layer: 'superficial', view: 'front', jointsCrossed: ['elbow', 'radioulnar'],
    function: 'Turns the palm down (pronation) and assists elbow flexion.',
    origin: 'Medial epicondyle of the humerus and coronoid process of the ulna.', insertion: 'Middle of the lateral surface of the radius.',
  },
  'flexor-carpi-radialis': {
    name: 'Flexor carpi radialis', latinName: 'Musculus flexor carpi radialis', parent: 'Wrist flexors',
    group: 'forearms', layer: 'superficial', view: 'front', jointsCrossed: ['elbow', 'wrist'],
    function: 'Flexes the wrist and bends it toward the thumb side.',
    origin: 'Medial epicondyle of the humerus (common flexor origin).', insertion: 'Bases of the 2nd and 3rd metacarpals.',
  },
  'palmaris-longus': {
    name: 'Palmaris longus', latinName: 'Musculus palmaris longus', parent: 'Wrist flexors',
    group: 'forearms', layer: 'superficial', view: 'front', jointsCrossed: ['elbow', 'wrist'],
    function: 'Weakly flexes the wrist and tenses the palm; missing in some people.',
    origin: 'Medial epicondyle of the humerus.', insertion: 'Palmar aponeurosis.',
  },
  'flexor-carpi-ulnaris': {
    name: 'Flexor carpi ulnaris', latinName: 'Musculus flexor carpi ulnaris', parent: 'Wrist flexors',
    group: 'forearms', layer: 'superficial', view: 'front', jointsCrossed: ['elbow', 'wrist'],
    function: 'Flexes the wrist and bends it toward the little-finger side.',
    origin: 'Medial epicondyle of the humerus, olecranon and back of the ulna.', insertion: 'Pisiform, hamate and 5th metacarpal.',
  },
  'flexor-digitorum-superficialis': {
    name: 'Flexor digitorum superficialis', latinName: 'Musculus flexor digitorum superficialis', parent: 'Finger flexors',
    group: 'forearms', layer: 'intermediate', view: 'front', jointsCrossed: ['elbow', 'wrist', 'fingers'],
    function: 'Flexes the fingers at the middle knuckles and helps flex the wrist; a key grip muscle.',
    origin: 'Medial epicondyle, coronoid process of the ulna and front of the radius.', insertion: 'Middle phalanges of fingers 2–5.',
  },
  'flexor-digitorum-profundus': {
    name: 'Flexor digitorum profundus', latinName: 'Musculus flexor digitorum profundus', parent: 'Finger flexors',
    group: 'forearms', layer: 'deep', view: 'front', jointsCrossed: ['wrist', 'fingers'],
    function: 'Flexes the fingertips; the main muscle of a closed, crushing grip.',
    origin: 'Front and medial surface of the ulna and the interosseous membrane.', insertion: 'Distal phalanges of fingers 2–5.',
  },
  'flexor-pollicis-longus': {
    name: 'Flexor pollicis longus', latinName: 'Musculus flexor pollicis longus', parent: 'Finger flexors',
    group: 'forearms', layer: 'deep', view: 'front', jointsCrossed: ['wrist', 'fingers'],
    function: 'Flexes the tip of the thumb, locking it around a bar.',
    origin: 'Front of the radius and the interosseous membrane.', insertion: 'Distal phalanx of the thumb.',
  },
  'pronator-quadratus': {
    name: 'Pronator quadratus', latinName: 'Musculus pronator quadratus',
    group: 'forearms', layer: 'deep', view: 'front', jointsCrossed: ['radioulnar'],
    function: 'The main pronator of the forearm.',
    origin: 'Lower quarter of the front of the ulna.', insertion: 'Lower quarter of the front of the radius.',
  },
  'extensor-carpi-radialis-longus': {
    name: 'Extensor carpi radialis longus', latinName: 'Musculus extensor carpi radialis longus', parent: 'Wrist extensors',
    group: 'forearms', layer: 'superficial', view: 'back', jointsCrossed: ['elbow', 'wrist'],
    function: 'Extends the wrist and bends it toward the thumb side; keeps the wrist set while gripping.',
    origin: 'Lateral supracondylar ridge of the humerus.', insertion: 'Base of the 2nd metacarpal.',
  },
  'extensor-carpi-radialis-brevis': {
    name: 'Extensor carpi radialis brevis', latinName: 'Musculus extensor carpi radialis brevis', parent: 'Wrist extensors',
    group: 'forearms', layer: 'superficial', view: 'back', jointsCrossed: ['elbow', 'wrist'],
    function: 'Extends the wrist and stabilises it during grip; the muscle usually involved in tennis elbow.',
    origin: 'Lateral epicondyle of the humerus (common extensor origin).', insertion: 'Base of the 3rd metacarpal.',
  },
  'extensor-carpi-ulnaris': {
    name: 'Extensor carpi ulnaris', latinName: 'Musculus extensor carpi ulnaris', parent: 'Wrist extensors',
    group: 'forearms', layer: 'superficial', view: 'back', jointsCrossed: ['elbow', 'wrist'],
    function: 'Extends the wrist and bends it toward the little-finger side.',
    origin: 'Lateral epicondyle of the humerus and back of the ulna.', insertion: 'Base of the 5th metacarpal.',
  },
  'extensor-digitorum': {
    name: 'Extensor digitorum', latinName: 'Musculus extensor digitorum',
    group: 'forearms', layer: 'superficial', view: 'back', jointsCrossed: ['elbow', 'wrist', 'fingers'],
    function: 'Extends the fingers and assists wrist extension.',
    origin: 'Lateral epicondyle of the humerus.', insertion: 'Extensor expansions of fingers 2–5.',
  },
  supinator: {
    name: 'Supinator', latinName: 'Musculus supinator',
    group: 'forearms', layer: 'deep', view: 'back', jointsCrossed: ['elbow', 'radioulnar'],
    function: 'Turns the palm up (supination), especially with the elbow straight.',
    origin: 'Lateral epicondyle, radial collateral ligament and supinator crest of the ulna.', insertion: 'Lateral surface of the upper radius.',
  },

  /* ---------------- Core and spine ---------------- */
  'rectus-abdominis': {
    name: 'Rectus abdominis', latinName: 'Musculus rectus abdominis',
    group: 'core', layer: 'superficial', view: 'front', jointsCrossed: ['thoracic-spine', 'lumbar-spine'],
    function: 'Flexes the trunk and tilts the pelvis back; resists arching in planks and rollouts.',
    origin: 'Pubic crest and pubic symphysis.', insertion: 'Xiphoid process and cartilages of ribs 5–7.',
  },
  'external-oblique': {
    name: 'External oblique', latinName: 'Musculus obliquus externus abdominis', parent: 'Obliques',
    group: 'core', layer: 'superficial', view: 'side', jointsCrossed: ['thoracic-spine', 'lumbar-spine'],
    function: 'Rotates the trunk to the opposite side, side-bends and flexes it, and compresses the abdomen.',
    origin: 'Outer surfaces of ribs 5–12.', insertion: 'Linea alba, pubic tubercle and front half of the iliac crest.',
  },
  'internal-oblique': {
    name: 'Internal oblique', latinName: 'Musculus obliquus internus abdominis', parent: 'Obliques',
    group: 'core', layer: 'intermediate', view: 'side', jointsCrossed: ['thoracic-spine', 'lumbar-spine'],
    function: 'Rotates the trunk to the same side, side-bends and flexes it; a key bracing muscle.',
    origin: 'Thoracolumbar fascia, front of the iliac crest and lateral inguinal ligament.',
    insertion: 'Lower ribs 10–12, linea alba and pubic crest.',
  },
  'transversus-abdominis': {
    name: 'Transversus abdominis', latinName: 'Musculus transversus abdominis',
    group: 'core', layer: 'deep', view: 'front', jointsCrossed: ['lumbar-spine'],
    function: 'Wraps the abdomen like a corset and raises intra-abdominal pressure when you brace.',
    origin: 'Cartilages of ribs 7–12, thoracolumbar fascia, iliac crest and inguinal ligament.', insertion: 'Linea alba and pubic crest.',
  },
  'quadratus-lumborum': {
    name: 'Quadratus lumborum', latinName: 'Musculus quadratus lumborum',
    group: 'core', layer: 'deep', view: 'back', jointsCrossed: ['lumbar-spine'],
    function: 'Side-bends the lower spine and hikes the hip; steadies the spine under one-sided loads such as carries.',
    origin: 'Back of the iliac crest and the iliolumbar ligament.', insertion: '12th rib and transverse processes of L1–L4.',
  },
  iliocostalis: {
    name: 'Iliocostalis', latinName: 'Musculus iliocostalis', parent: 'Erector spinae',
    group: 'back', layer: 'intermediate', view: 'back', jointsCrossed: ['cervical-spine', 'thoracic-spine', 'lumbar-spine'],
    function: 'Extends and side-bends the spine; holds it neutral when you hinge or squat.',
    origin: 'Sacrum, iliac crest and ribs.', insertion: 'Angles of the ribs and cervical transverse processes.',
  },
  longissimus: {
    name: 'Longissimus', latinName: 'Musculus longissimus', parent: 'Erector spinae',
    group: 'back', layer: 'intermediate', view: 'back', jointsCrossed: ['cervical-spine', 'thoracic-spine', 'lumbar-spine'],
    function: 'Extends the spine and head; the largest erector column and key in deadlifts.',
    origin: 'Sacrum, iliac crest and transverse processes of the lumbar and thoracic vertebrae.',
    insertion: 'Transverse processes of the thoracic and cervical vertebrae, the ribs and the mastoid process.',
  },
  spinalis: {
    name: 'Spinalis', latinName: 'Musculus spinalis', parent: 'Erector spinae',
    group: 'back', layer: 'intermediate', view: 'back', jointsCrossed: ['thoracic-spine', 'lumbar-spine'],
    function: 'Extends the spine; the thin, innermost erector column.',
    origin: 'Spinous processes of the upper lumbar and lower thoracic vertebrae.', insertion: 'Spinous processes of the upper thoracic vertebrae.',
  },
  multifidus: {
    name: 'Multifidus', latinName: 'Musculus multifidus',
    group: 'back', layer: 'deep', view: 'back', jointsCrossed: ['thoracic-spine', 'lumbar-spine'],
    function: 'Stiffens and extends individual spinal segments; a key local stabiliser of the lower back.',
    origin: 'Sacrum, iliac crest and the transverse and mammillary processes of the vertebrae.',
    insertion: 'Spinous processes two to four vertebrae higher.',
  },
  diaphragm: {
    name: 'Diaphragm', latinName: 'Diaphragma',
    group: 'core', layer: 'deep', view: 'front', jointsCrossed: [],
    function: 'The main breathing muscle; also the roof of the pressurised "cylinder" that stiffens the trunk when you brace.',
    origin: 'Xiphoid process, lower six costal cartilages and the upper lumbar vertebrae (crura).', insertion: 'Central tendon.',
  },

  /* ---------------- Neck ---------------- */
  sternocleidomastoid: {
    name: 'Sternocleidomastoid', latinName: 'Musculus sternocleidomastoideus',
    group: 'neck', layer: 'superficial', view: 'front', jointsCrossed: ['cervical-spine'],
    function: 'Flexes the neck and turns the head to the opposite side.',
    origin: 'Manubrium of the sternum and the medial clavicle.', insertion: 'Mastoid process of the temporal bone.',
  },
  'splenius-capitis': {
    name: 'Splenius capitis', latinName: 'Musculus splenius capitis',
    group: 'neck', layer: 'intermediate', view: 'back', jointsCrossed: ['cervical-spine'],
    function: 'Extends the head and turns it to the same side.',
    origin: 'Nuchal ligament and spinous processes of C7–T3.', insertion: 'Mastoid process and lateral superior nuchal line.',
  },
  scalenes: {
    name: 'Scalenes', latinName: 'Musculi scaleni',
    group: 'neck', layer: 'deep', view: 'side', jointsCrossed: ['cervical-spine'],
    function: 'Side-bend the neck and lift the upper ribs during heavy breathing.',
    origin: 'Transverse processes of C2–C7.', insertion: 'Ribs 1 and 2.',
  },

  /* ---------------- Hip ---------------- */
  iliacus: {
    name: 'Iliacus', latinName: 'Musculus iliacus', parent: 'Iliopsoas',
    group: 'hips', layer: 'deep', view: 'front', jointsCrossed: ['hip'],
    function: 'Flexes the hip; with psoas, the strongest hip flexor.',
    origin: 'Iliac fossa of the pelvis.', insertion: 'Lesser trochanter of the femur, with psoas.',
  },
  'psoas-major': {
    name: 'Psoas major', latinName: 'Musculus psoas major', parent: 'Iliopsoas',
    group: 'hips', layer: 'deep', view: 'front', jointsCrossed: ['hip', 'lumbar-spine'],
    function: 'Flexes the hip and steadies the lumbar spine; works hard in leg raises and sprinting.',
    origin: 'Bodies and transverse processes of T12–L5.', insertion: 'Lesser trochanter of the femur.',
  },
  'gluteus-maximus': {
    name: 'Gluteus maximus', latinName: 'Musculus gluteus maximus', parent: 'Glutes',
    group: 'hips', layer: 'superficial', view: 'back', jointsCrossed: ['hip'],
    function: 'Extends and externally rotates the hip; the main driver of hip thrusts, deep squats and sprinting.',
    origin: 'Back of the ilium, sacrum, coccyx and sacrotuberous ligament.', insertion: 'Gluteal tuberosity of the femur and the iliotibial band.',
  },
  'gluteus-medius': {
    name: 'Gluteus medius', latinName: 'Musculus gluteus medius', parent: 'Glutes',
    group: 'hips', layer: 'intermediate', view: 'side', jointsCrossed: ['hip'],
    function: 'Abducts the hip and keeps the pelvis level when you stand on one leg.',
    origin: 'Outer surface of the ilium between the anterior and posterior gluteal lines.', insertion: 'Lateral surface of the greater trochanter.',
  },
  'gluteus-minimus': {
    name: 'Gluteus minimus', latinName: 'Musculus gluteus minimus', parent: 'Glutes',
    group: 'hips', layer: 'deep', view: 'side', jointsCrossed: ['hip'],
    function: 'Abducts and internally rotates the hip and keeps the femoral head seated.',
    origin: 'Outer surface of the ilium between the anterior and inferior gluteal lines.', insertion: 'Front of the greater trochanter.',
  },
  'tensor-fasciae-latae': {
    name: 'Tensor fasciae latae', latinName: 'Musculus tensor fasciae latae',
    group: 'hips', layer: 'superficial', view: 'side', jointsCrossed: ['hip', 'knee'],
    function: 'Flexes, abducts and internally rotates the hip and tenses the iliotibial band.',
    origin: 'Anterior superior iliac spine and front of the iliac crest.', insertion: 'Iliotibial band, to the lateral condyle of the tibia.',
  },
  piriformis: {
    name: 'Piriformis', latinName: 'Musculus piriformis',
    group: 'hips', layer: 'deep', view: 'back', jointsCrossed: ['hip'],
    function: 'Externally rotates the extended hip and abducts the flexed hip.',
    origin: 'Front surface of the sacrum.', insertion: 'Upper border of the greater trochanter.',
  },
  'deep-hip-rotators': {
    name: 'Deep hip rotators', latinName: 'Obturatorii, gemelli et quadratus femoris',
    group: 'hips', layer: 'deep', view: 'back', jointsCrossed: ['hip'],
    function: 'Externally rotate the hip and press the femoral head into its socket.',
    origin: 'Obturator membrane, ischium and pubis.', insertion: 'Greater trochanter and intertrochanteric crest of the femur.',
  },
  sartorius: {
    name: 'Sartorius', latinName: 'Musculus sartorius',
    group: 'thighs', layer: 'superficial', view: 'front', jointsCrossed: ['hip', 'knee'],
    function: 'Flexes, abducts and externally rotates the hip and flexes the knee (the cross-legged position).',
    origin: 'Anterior superior iliac spine.', insertion: 'Upper medial tibia (pes anserinus).',
  },

  /* ---------------- Thigh ---------------- */
  'rectus-femoris': {
    name: 'Rectus femoris', latinName: 'Musculus rectus femoris', parent: 'Quadriceps',
    group: 'thighs', layer: 'superficial', view: 'front', jointsCrossed: ['hip', 'knee'],
    function: 'Extends the knee and flexes the hip; the only quad that crosses two joints.',
    origin: 'Anterior inferior iliac spine and the rim above the hip socket.', insertion: 'Tibial tuberosity via the patella and patellar ligament.',
  },
  'vastus-lateralis': {
    name: 'Vastus lateralis', latinName: 'Musculus vastus lateralis', parent: 'Quadriceps',
    group: 'thighs', layer: 'superficial', view: 'front', jointsCrossed: ['knee'],
    function: 'Extends the knee; the largest quad.',
    origin: 'Greater trochanter and lateral lip of the linea aspera.', insertion: 'Tibial tuberosity via the patella and patellar ligament.',
  },
  'vastus-medialis': {
    name: 'Vastus medialis', latinName: 'Musculus vastus medialis', parent: 'Quadriceps',
    group: 'thighs', layer: 'superficial', view: 'front', jointsCrossed: ['knee'],
    function: 'Extends the knee and steadies the kneecap; its "teardrop" is most visible near lockout.',
    origin: 'Intertrochanteric line and medial lip of the linea aspera.', insertion: 'Tibial tuberosity via the patella and patellar ligament.',
  },
  'vastus-intermedius': {
    name: 'Vastus intermedius', latinName: 'Musculus vastus intermedius', parent: 'Quadriceps',
    group: 'thighs', layer: 'deep', view: 'front', jointsCrossed: ['knee'],
    function: 'Extends the knee; lies underneath rectus femoris.',
    origin: 'Front and lateral surfaces of the femoral shaft.', insertion: 'Tibial tuberosity via the patella and patellar ligament.',
  },
  'biceps-femoris-long': {
    name: 'Biceps femoris, long head', latinName: 'Biceps femoris, caput longum', parent: 'Hamstrings',
    group: 'thighs', layer: 'superficial', view: 'back', jointsCrossed: ['hip', 'knee'],
    function: 'Extends the hip, flexes the knee and externally rotates the bent knee.',
    origin: 'Ischial tuberosity.', insertion: 'Head of the fibula.',
  },
  'biceps-femoris-short': {
    name: 'Biceps femoris, short head', latinName: 'Biceps femoris, caput breve', parent: 'Hamstrings',
    group: 'thighs', layer: 'intermediate', view: 'back', jointsCrossed: ['knee'],
    function: 'Flexes the knee and externally rotates it; the only hamstring part that does not cross the hip.',
    origin: 'Lateral lip of the linea aspera of the femur.', insertion: 'Head of the fibula.',
  },
  semitendinosus: {
    name: 'Semitendinosus', latinName: 'Musculus semitendinosus', parent: 'Hamstrings',
    group: 'thighs', layer: 'superficial', view: 'back', jointsCrossed: ['hip', 'knee'],
    function: 'Extends the hip, flexes the knee and internally rotates the bent knee.',
    origin: 'Ischial tuberosity.', insertion: 'Upper medial tibia (pes anserinus).',
  },
  semimembranosus: {
    name: 'Semimembranosus', latinName: 'Musculus semimembranosus', parent: 'Hamstrings',
    group: 'thighs', layer: 'intermediate', view: 'back', jointsCrossed: ['hip', 'knee'],
    function: 'Extends the hip, flexes the knee and internally rotates the bent knee.',
    origin: 'Ischial tuberosity.', insertion: 'Back of the medial condyle of the tibia.',
  },
  'adductor-magnus': {
    name: 'Adductor magnus', latinName: 'Musculus adductor magnus', parent: 'Adductors',
    group: 'thighs', layer: 'intermediate', view: 'back', jointsCrossed: ['hip'],
    function: 'Adducts the hip; its rear (hamstring) part is a strong hip extensor, especially in deep squats.',
    origin: 'Inferior pubic ramus, ischial ramus and ischial tuberosity.', insertion: 'Linea aspera and adductor tubercle of the femur.',
  },
  'adductor-longus': {
    name: 'Adductor longus', latinName: 'Musculus adductor longus', parent: 'Adductors',
    group: 'thighs', layer: 'superficial', view: 'front', jointsCrossed: ['hip'],
    function: 'Adducts the hip and helps flex it from an extended position.',
    origin: 'Body of the pubis below the pubic crest.', insertion: 'Middle third of the linea aspera.',
  },
  'adductor-brevis': {
    name: 'Adductor brevis', latinName: 'Musculus adductor brevis', parent: 'Adductors',
    group: 'thighs', layer: 'intermediate', view: 'front', jointsCrossed: ['hip'],
    function: 'Adducts the hip and helps flex it.',
    origin: 'Body and inferior ramus of the pubis.', insertion: 'Pectineal line and upper linea aspera of the femur.',
  },
  pectineus: {
    name: 'Pectineus', latinName: 'Musculus pectineus', parent: 'Adductors',
    group: 'thighs', layer: 'intermediate', view: 'front', jointsCrossed: ['hip'],
    function: 'Adducts and flexes the hip.',
    origin: 'Pectineal line of the pubis.', insertion: 'Pectineal line of the femur.',
  },
  gracilis: {
    name: 'Gracilis', latinName: 'Musculus gracilis', parent: 'Adductors',
    group: 'thighs', layer: 'superficial', view: 'front', jointsCrossed: ['hip', 'knee'],
    function: 'Adducts the hip and flexes and internally rotates the knee.',
    origin: 'Body and inferior ramus of the pubis.', insertion: 'Upper medial tibia (pes anserinus).',
  },

  /* ---------------- Lower leg ---------------- */
  'gastrocnemius-medial': {
    name: 'Gastrocnemius, medial head', latinName: 'Gastrocnemius, caput mediale', parent: 'Calves',
    group: 'lower-legs', layer: 'superficial', view: 'back', jointsCrossed: ['knee', 'ankle'],
    function: 'Points the foot and helps bend the knee; works most with the knee straight (standing calf raises).',
    origin: 'Femur, just above the medial condyle.', insertion: 'Calcaneus via the Achilles tendon.',
  },
  'gastrocnemius-lateral': {
    name: 'Gastrocnemius, lateral head', latinName: 'Gastrocnemius, caput laterale', parent: 'Calves',
    group: 'lower-legs', layer: 'superficial', view: 'back', jointsCrossed: ['knee', 'ankle'],
    function: 'Points the foot and helps bend the knee; works most with the knee straight.',
    origin: 'Lateral condyle of the femur.', insertion: 'Calcaneus via the Achilles tendon.',
  },
  soleus: {
    name: 'Soleus', latinName: 'Musculus soleus', parent: 'Calves',
    group: 'lower-legs', layer: 'intermediate', view: 'back', jointsCrossed: ['ankle'],
    function: 'Points the foot; dominant when the knee is bent (seated calf raises) and key for standing balance.',
    origin: 'Head and upper back of the fibula and the soleal line of the tibia.', insertion: 'Calcaneus via the Achilles tendon.',
  },
  popliteus: {
    name: 'Popliteus', latinName: 'Musculus popliteus',
    group: 'lower-legs', layer: 'deep', view: 'back', jointsCrossed: ['knee'],
    function: 'Unlocks the straight knee by rotating it and resists the femur sliding forward.',
    origin: 'Lateral condyle of the femur.', insertion: 'Back of the tibia above the soleal line.',
  },
  'tibialis-anterior': {
    name: 'Tibialis anterior', latinName: 'Musculus tibialis anterior',
    group: 'lower-legs', layer: 'superficial', view: 'front', jointsCrossed: ['ankle', 'subtalar'],
    function: 'Lifts and turns in the foot; controls the foot as it lands.',
    origin: 'Lateral condyle and upper lateral surface of the tibia.', insertion: 'Medial cuneiform and base of the 1st metatarsal.',
  },
  'tibialis-posterior': {
    name: 'Tibialis posterior', latinName: 'Musculus tibialis posterior',
    group: 'lower-legs', layer: 'deep', view: 'back', jointsCrossed: ['ankle', 'subtalar'],
    function: 'Turns in and points the foot and supports the arch.',
    origin: 'Back of the tibia, fibula and interosseous membrane.', insertion: 'Navicular tuberosity and neighbouring tarsal bones.',
  },
  'fibularis-longus': {
    name: 'Fibularis longus', latinName: 'Musculus fibularis longus', parent: 'Fibularis',
    group: 'lower-legs', layer: 'superficial', view: 'side', jointsCrossed: ['ankle', 'subtalar'],
    function: 'Turns out and points the foot; supports the arches and steadies the ankle.',
    origin: 'Head and upper lateral surface of the fibula.', insertion: 'Medial cuneiform and base of the 1st metatarsal, under the foot.',
  },
  'fibularis-brevis': {
    name: 'Fibularis brevis', latinName: 'Musculus fibularis brevis', parent: 'Fibularis',
    group: 'lower-legs', layer: 'intermediate', view: 'side', jointsCrossed: ['ankle', 'subtalar'],
    function: 'Turns out the foot and resists ankle rolling.',
    origin: 'Lower lateral surface of the fibula.', insertion: 'Base of the 5th metatarsal.',
  },
  'extensor-digitorum-longus': {
    name: 'Extensor digitorum longus', latinName: 'Musculus extensor digitorum longus',
    group: 'lower-legs', layer: 'superficial', view: 'front', jointsCrossed: ['ankle', 'toes'],
    function: 'Lifts the toes and the foot.',
    origin: 'Lateral condyle of the tibia and upper fibula.', insertion: 'Middle and distal phalanges of toes 2–5.',
  },
  'flexor-hallucis-longus': {
    name: 'Flexor hallucis longus', latinName: 'Musculus flexor hallucis longus',
    group: 'lower-legs', layer: 'deep', view: 'back', jointsCrossed: ['ankle', 'toes'],
    function: 'Flexes the big toe; helps push off and supports the arch.',
    origin: 'Lower back of the fibula.', insertion: 'Distal phalanx of the big toe.',
  },
};

export const MUSCLES: Muscle[] = Object.entries(DATA).map(([id, data]) => ({ id: id as MuscleId, ...data }));

export const MUSCLE_BY_ID: Record<MuscleId, Muscle> = Object.fromEntries(
  MUSCLES.map((m) => [m.id, m]),
) as Record<MuscleId, Muscle>;
