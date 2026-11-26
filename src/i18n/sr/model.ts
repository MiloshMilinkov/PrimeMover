import { dict } from './dict';

/**
 * Serbian (latinica): bone and minor-muscle names stored in the model files, shown in
 * hover tooltips. Numbered bones are generated, because Serbian ordinals change with
 * gender and case: prvi pršljen, prvo rebro, prva kost, disk prvog pršljena.
 */
const EN_ORDINALS = ['first', 'second', 'third', 'fourth', 'fifth', 'sixth', 'seventh', 'eighth', 'ninth', 'tenth', 'eleventh', 'twelfth'];
const ROOTS = ['prv', 'drug', 'treć', 'četvrt', 'pet', 'šest', 'sedm', 'osm', 'devet', 'deset', 'jedanaest', 'dvanaest'];
/** Masculine, neuter and feminine nominative, and masculine genitive. */
const ordinal = (i: number, form: 'm' | 'n' | 'f' | 'mGen') => {
  const root = ROOTS[i];
  const soft = root.endsWith('ć'); // treći / treće / treća / trećeg
  return { m: `${root}i`, n: soft ? `${root}e` : `${root}o`, f: `${root}a`, mGen: soft ? `${root}eg` : `${root}og` }[form];
};

const REGIONS: [string, string, string, number][] = [
  // English, Serbian adjective (nominative), Serbian adjective (genitive), count
  ['cervical', 'vratni', 'vratnog', 7],
  ['thoracic', 'grudni', 'grudnog', 12],
  ['lumbar', 'slabinski', 'slabinskog', 5],
];

const generated: [string, string][] = [];
REGIONS.forEach(([en, nom, gen, count]) => {
  for (let i = 0; i < count; i++) {
    generated.push([`${EN_ORDINALS[i]} ${en} vertebra`, `${ordinal(i, 'm')} ${nom} pršljen`]);
    generated.push([`intervertebral disk of ${EN_ORDINALS[i]} ${en} vertebra`, `međupršljenski disk ${ordinal(i, 'mGen')} ${gen} pršljena`]);
  }
});
EN_ORDINALS.forEach((en, i) => {
  generated.push([`${en} rib`, `${ordinal(i, 'n')} rebro`]);
  if (i < 7) generated.push([`${en} costal cartilage`, `${ordinal(i, 'f')} rebarna hrskavica`]);
  if (i < 5) {
    generated.push([`${en} metacarpal bone`, `${ordinal(i, 'f')} kost doručja`]);
    generated.push([`${en} metatarsal bone`, `${ordinal(i, 'f')} kost donožja`]);
  }
  if (i < 4) generated.push([`${en} lumbrical of foot`, `${ordinal(i, 'm')} crvoliki mišić stopala`]);
  if (i < 3) generated.push([`${en} plantar interosseous of foot`, `${ordinal(i, 'm')} donji međukoštani mišić stopala`]);
});

const DIGITS: [string, string][] = [
  ['thumb', 'palca'],
  ['index finger', 'kažiprsta'],
  ['middle finger', 'srednjeg prsta'],
  ['ring finger', 'domalog prsta'],
  ['little finger', 'malog prsta'],
  ['big toe', 'palca stopala'],
  ['second toe', 'drugog prsta stopala'],
  ['third toe', 'trećeg prsta stopala'],
  ['fourth toe', 'četvrtog prsta stopala'],
  ['little toe', 'malog prsta stopala'],
];
const PHALANGES: [string, string][] = [
  ['proximal', 'osnovni'],
  ['middle', 'srednji'],
  ['distal', 'krajnji'],
];
for (const [enP, srP] of PHALANGES) for (const [enD, srD] of DIGITS) generated.push([`${enP} phalanx of ${enD}`, `${srP} članak ${srD}`]);

export const MODEL_SR = dict([
  ...generated,
  ['intervertebral disk', 'međupršljenski disk'],
  ['intervertebral disk of axis', 'međupršljenski disk drugog vratnog pršljena'],
  ['atlas', 'prvi vratni pršljen (atlas)'],
  ['axis', 'drugi vratni pršljen (aksis)'],

  /* ---------- bones ---------- */
  ['hyoid bone', 'podjezična kost'],
  ['hip bone', 'karlična kost'],
  ['ethmoid', 'rešetkasta kost'],
  ['frontal bone', 'čeona kost'],
  ['parietal bone', 'temena kost'],
  ['temporal bone', 'slepoočna kost'],
  ['occipital bone', 'potiljačna kost'],
  ['sphenoid bone', 'klinasta kost lobanje'],
  ['zygomatic bone', 'jagodična kost'],
  ['maxilla', 'gornja vilica'],
  ['mandible', 'donja vilica'],
  ['nasal bone', 'nosna kost'],
  ['lacrimal bone', 'suzna kost'],
  ['palatine bone', 'nepčana kost'],
  ['inferior nasal concha', 'donja nosna školjka'],
  ['vomer', 'raonik'],
  ['clavicle', 'ključna kost'],
  ['scapula', 'lopatica'],
  ['humerus', 'nadlaktična kost'],
  ['radius', 'palčana kost'],
  ['ulna', 'lakatna kost'],
  ['scaphoid', 'čunasta kost'],
  ['lunate', 'polumesečasta kost'],
  ['triquetral', 'trouglasta kost'],
  ['pisiform', 'graškasta kost'],
  ['trapezium', 'trapezna kost'],
  ['trapezoid', 'trapezoidna kost'],
  ['capitate', 'glavičasta kost'],
  ['hamate', 'kukasta kost'],
  ['sacrum', 'krsna kost'],
  ['femur', 'butna kost'],
  ['patella', 'čašica'],
  ['tibia', 'golenjača'],
  ['fibula', 'lišnjača'],
  ['talus', 'skočna kost'],
  ['calcaneus', 'petna kost'],
  ['navicular bone of foot', 'čunasta kost stopala'],
  ['cuboid bone', 'kockasta kost'],
  ['medial cuneiform bone', 'unutrašnja klinasta kost'],
  ['intermediate cuneiform bone', 'srednja klinasta kost'],
  ['lateral cuneiform bone', 'spoljašnja klinasta kost'],
  ['sesamoid bone of foot', 'sezamoidna kost stopala'],

  /* ---------- minor muscles (not in the exercise data) ---------- */
  ['abductor digiti minimi of foot', 'odmicač malog prsta stopala'],
  ['flexor digiti minimi brevis of foot', 'kratki pregibač malog prsta stopala'],
  ['opponens digiti minimi of foot', 'suprotstavljač malog prsta stopala'],
  ['abductor hallucis', 'odmicač palca stopala'],
  ['extensor hallucis brevis', 'kratki opružač palca stopala'],
  ['extensor hallucis longus', 'dugi opružač palca stopala'],
  ['fibularis tertius', 'treći lišnjačni mišić'],
  ['flexor accessorius', 'četvrtasti mišić tabana'],
  ['flexor digitorum brevis', 'kratki pregibač prstiju stopala'],
  ['flexor digitorum longus', 'dugi pregibač prstiju stopala'],
  ['plantaris', 'tabanski mišić (plantaris)'],
  ['lateral head of flexor hallucis brevis', 'spoljašnja glava kratkog pregibača palca stopala'],
  ['medial head of flexor hallucis brevis', 'unutrašnja glava kratkog pregibača palca stopala'],
  ['oblique head of adductor hallucis', 'kosa glava primicača palca stopala'],
  ['transverse head of adductor hallucis', 'poprečna glava primicača palca stopala'],
  ['external intercostal muscle', 'spoljašnji međurebarni mišić'],
  ['internal intercostal muscle', 'unutrašnji međurebarni mišić'],
  ['innermost intercostal muscle', 'najdublji međurebarni mišić'],
  ['subclavius', 'potključni mišić'],
  ['transversus thoracis', 'poprečni grudni mišić'],
  ['serratus posterior superior', 'gornji zadnji nazubljeni mišić'],
  ['serratus posterior inferior', 'donji zadnji nazubljeni mišić'],
  ['abductor digiti minimi of hand', 'odmicač malog prsta šake'],
  ['flexor digiti minimi brevis of hand', 'kratki pregibač malog prsta šake'],
  ['opponens digiti minimi of hand', 'suprotstavljač malog prsta šake'],
  ['flexor pollicis brevis', 'kratki pregibač palca'],
  ['superficial head of flexor pollicis brevis', 'površna glava kratkog pregibača palca'],
  ['abductor pollicis brevis', 'kratki odmicač palca'],
  ['abductor pollicis longus', 'dugi odmicač palca'],
  ['opponens pollicis', 'suprotstavljač palca'],
  ['oblique head of adductor pollicis', 'kosa glava primicača palca'],
  ['transverse head of adductor pollicis', 'poprečna glava primicača palca'],
  ['extensor digiti minimi', 'opružač malog prsta'],
  ['extensor indicis', 'opružač kažiprsta'],
  ['extensor pollicis brevis', 'kratki opružač palca'],
  ['extensor pollicis longus', 'dugi opružač palca'],
  ['cervical rotator', 'vratni rotator'],
  ['thoracic rotator', 'grudni rotator'],
  ['lumbar rotator', 'slabinski rotator'],
  ['semispinalis capitis', 'polutrnasti mišić glave'],
  ['semispinalis cervicis', 'polutrnasti mišić vrata'],
  ['semispinalis thoracis', 'polutrnasti mišić grudi'],
  ['spinalis', 'trnasti mišić (spinalis)'],
  ['splenius cervicis', 'pločasti mišić vrata'],
  ['lateral lumbar intertransversarius', 'spoljašnji slabinski međupoprečni mišić'],
  ['medial lumbar intertransversarius', 'unutrašnji slabinski međupoprečni mišić'],
  ['interspinalis thoracis', 'grudni međutrnasti mišić'],
  ['digastric', 'dvotrbušni mišić'],
  ['geniohyoid', 'bradno-podjezični mišić'],
  ['mylohyoid', 'vilično-podjezični mišić'],
  ['stylohyoid', 'stilo-podjezični mišić'],
  ['omohyoid', 'lopatično-podjezični mišić'],
  ['sternohyoid', 'grudno-podjezični mišić'],
  ['sternothyroid', 'grudno-štitasti mišić'],
  ['thyrohyoid', 'štitasto-podjezični mišić'],
  ['longus capitis', 'dugi mišić glave'],
  ['rectus capitis anterior', 'prednji pravi mišić glave'],
  ['rectus capitis lateralis', 'bočni pravi mišić glave'],
  ['rectus capitis posterior major', 'veliki zadnji pravi mišić glave'],
  ['rectus capitis posterior minor', 'mali zadnji pravi mišić glave'],
  ['obliquus capitis superior', 'gornji kosi mišić glave'],
  ['obliquus capitis inferior', 'donji kosi mišić glave'],
  ['inferior oblique part of longus colli', 'donji kosi deo dugog mišića vrata'],
  ['superior oblique part of longus colli', 'gornji kosi deo dugog mišića vrata'],
  ['vertical intermediate part of longus colli', 'uspravni srednji deo dugog mišića vrata'],
  ['aryepiglotticus', 'aritenoidno-epiglotični mišić'],
]);
