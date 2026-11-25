/*
 * Prime Mover
 * Copyright (c) 2026 Miloš Milinkov. All rights reserved.
 * Proprietary and confidential. See the LICENSE file.
 *
 * Builds pipeline/mesh-map.csv: BodyParts3D concept/mesh -> app muscle id.
 * Usage: node pipeline/scripts/build-mesh-map.mjs <bp3d source dir> <out csv>
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { MESH_MAP_HEADER } from './lib/mesh-map.mjs';

const [srcDir, outCsv] = process.argv.slice(2);
if (!srcDir || !outCsv) {
  console.error('usage: build-mesh-map.mjs <bp3d dir> <out.csv>');
  process.exit(1);
}

/**
 * App muscle id -> BodyParts3D concept names. `{s}` is replaced by left/right.
 * Several names per id are unioned (e.g. the deep hip rotators).
 * GENERATED means BodyParts3D has no mesh and the pipeline builds one.
 */
const GENERATED = 'GENERATED';
const MUSCLE_SPEC = {
  'deltoid-anterior': ['clavicular part of {s} deltoid'],
  'deltoid-lateral': ['acromial part of {s} deltoid'],
  'deltoid-posterior': ['spinal part of {s} deltoid'],
  supraspinatus: ['{s} supraspinatus'],
  infraspinatus: ['{s} infraspinatus muscle'],
  'teres-minor': ['{s} teres minor'],
  subscapularis: ['{s} subscapularis'],
  'teres-major': ['{s} teres major'],
  'trapezius-upper': ['descending part of {s} trapezius'],
  'trapezius-middle': ['transverse part of {s} trapezius'],
  'trapezius-lower': ['ascending part of {s} trapezius'],
  'rhomboid-major': ['{s} rhomboid major'],
  'rhomboid-minor': ['{s} rhomboid minor'],
  'levator-scapulae': ['{s} levator scapulae'],
  'serratus-anterior': ['{s} serratus anterior'],
  'latissimus-dorsi': GENERATED,
  'pectoralis-major-clavicular': ['clavicular part of {s} pectoralis major'],
  'pectoralis-major-sternocostal': ['sternocostal part of {s} pectoralis major'],
  'pectoralis-major-abdominal': ['abdominal part of {s} pectoralis major'],
  'pectoralis-minor': ['{s} pectoralis minor'],
  'biceps-brachii-long': ['long head of {s} biceps brachii'],
  'biceps-brachii-short': ['short head of {s} biceps brachii'],
  brachialis: ['{s} brachialis'],
  coracobrachialis: ['{s} coracobrachialis'],
  'triceps-long': ['long head of {s} triceps brachii'],
  'triceps-lateral': ['lateral head of {s} triceps brachii'],
  'triceps-medial': ['medial head of {s} triceps brachii'],
  anconeus: ['{s} anconeus'],
  brachioradialis: ['{s} brachioradialis'],
  'pronator-teres': ['humeral head of {s} pronator teres', 'ulnar head of {s} pronator teres'],
  'flexor-carpi-radialis': ['{s} flexor carpi radialis'],
  'palmaris-longus': ['{s} palmaris longus'],
  'flexor-carpi-ulnaris': ['humeral head of {s} flexor carpi ulnaris', 'ulnar head of {s} flexor carpi ulnaris'],
  'flexor-digitorum-superficialis': ['{s} flexor digitorum superficialis'],
  'flexor-digitorum-profundus': ['{s} flexor digitorum profundus'],
  'flexor-pollicis-longus': ['{s} flexor pollicis longus'],
  'pronator-quadratus': ['{s} pronator quadratus'],
  'extensor-carpi-radialis-longus': ['{s} extensor carpi radialis longus'],
  'extensor-carpi-radialis-brevis': ['{s} extensor carpi radialis brevis'],
  'extensor-carpi-ulnaris': ['{s} extensor carpi ulnaris'],
  'extensor-digitorum': ['{s} extensor digitorum'],
  supinator: ['{s} supinator'],
  'rectus-abdominis': GENERATED,
  'external-oblique': ['{s} external oblique'],
  'internal-oblique': GENERATED,
  'transversus-abdominis': GENERATED,
  'quadratus-lumborum': GENERATED,
  iliocostalis: ['{s} iliocostalis cervicis', '{s} iliocostalis thoracis', '{s} iliocostalis lumborum'],
  longissimus: ['{s} longissimus capitis', '{s} longissimus cervicis', '{s} longissimus thoracis'],
  spinalis: ['{s} spinalis', '{s} spinalis thoracis', '{s} spinalis cervicis', '{s} spinalis capitis'],
  multifidus: GENERATED,
  diaphragm: ['diaphragm'],
  sternocleidomastoid: ['{s} sternocleidomastoid'],
  'splenius-capitis': ['{s} splenius capitis'],
  scalenes: ['{s} scalenus anterior', '{s} scalenus medius', '{s} scalenus posterior'],
  iliacus: ['{s} iliacus'],
  'psoas-major': ['{s} psoas major'],
  'gluteus-maximus': ['{s} gluteus maximus'],
  'gluteus-medius': ['{s} gluteus medius'],
  'gluteus-minimus': ['{s} gluteus minimus'],
  'tensor-fasciae-latae': ['{s} tensor fasciae latae'],
  piriformis: ['{s} piriformis'],
  'deep-hip-rotators': [
    '{s} obturator internus',
    '{s} obturator externus',
    '{s} gemellus superior',
    '{s} gemellus inferior',
    '{s} quadratus femoris',
  ],
  sartorius: ['{s} sartorius'],
  'rectus-femoris': ['{s} rectus femoris'],
  'vastus-lateralis': ['{s} vastus lateralis'],
  'vastus-medialis': ['{s} vastus medialis'],
  'vastus-intermedius': ['{s} vastus intermedius'],
  'biceps-femoris-long': ['long head of {s} biceps femoris'],
  'biceps-femoris-short': ['short head of {s} biceps femoris'],
  semitendinosus: ['{s} semitendinosus'],
  semimembranosus: ['{s} semimembranosus'],
  'adductor-magnus': ['{s} adductor magnus', '{s} adductor minimus'],
  'adductor-longus': ['{s} adductor longus'],
  'adductor-brevis': ['{s} adductor brevis'],
  pectineus: ['{s} pectineus'],
  gracilis: ['{s} gracilis'],
  'gastrocnemius-medial': ['medial head of {s} gastrocnemius'],
  'gastrocnemius-lateral': ['lateral head of {s} gastrocnemius'],
  soleus: ['{s} soleus'],
  popliteus: ['{s} popliteus'],
  'tibialis-anterior': ['{s} tibialis anterior'],
  'tibialis-posterior': ['{s} tibialis posterior'],
  'fibularis-longus': ['{s} fibularis longus', '{s} peroneus longus'],
  'fibularis-brevis': ['{s} fibularis brevis', '{s} peroneus brevis'],
  'extensor-digitorum-longus': ['{s} extensor digitorum longus'],
  'flexor-hallucis-longus': ['{s} flexor hallucis longus'],
};

const readTsv = (file) =>
  readFileSync(join(srcDir, file), 'utf8')
    .split(/\r?\n/)
    .slice(1)
    .filter(Boolean)
    .map((line) => line.split('\t'));

// concept name -> { fma, files[] }
const concepts = new Map();
for (const [fma, name, file] of readTsv('isa_element_parts.txt')) {
  const c = concepts.get(name) ?? { fma, files: [] };
  c.files.push(file);
  concepts.set(name, c);
}

const filesOf = (name) => concepts.get(name)?.files ?? [];
// Whole muscles sit under 'muscle organ'; heads and parts under 'zone of muscle organ'.
const muscleFiles = new Set([
  ...filesOf('muscle organ'),
  ...filesOf('zone of muscle organ'),
  ...filesOf('head of muscle organ'),
]);
const boneFiles = new Set([
  ...filesOf('bone organ'),
  ...filesOf('costal cartilage'),
  ...filesOf('intervertebral disk'),
]);

// Smallest concept name that owns each file (its own element concept).
const fileName = new Map();
for (const [name, c] of concepts) {
  for (const f of c.files) {
    const prev = fileName.get(f);
    if (!prev || concepts.get(prev).files.length > c.files.length) fileName.set(f, name);
  }
}

const rows = [];
const claimed = new Map(); // file -> app id
const problems = [];

for (const [appId, spec] of Object.entries(MUSCLE_SPEC)) {
  const sides = spec === GENERATED || spec.some((t) => t.includes('{s}')) ? ['left', 'right'] : ['center'];
  for (const side of sides) {
    if (spec === GENERATED) {
      rows.push({ appId, side, concept: '(generated by pipeline)', fma: '', file: '', status: 'generated' });
      continue;
    }
    let found = 0;
    for (const tpl of spec) {
      const name = tpl.replace('{s}', side);
      const c = concepts.get(name);
      if (!c) continue;
      for (const file of c.files) {
        // Some muscle parts (e.g. trapezius parts) only sit under generic "organ zone",
        // so trust the explicit spec and only reject skeleton files.
        if (boneFiles.has(file)) {
          problems.push(`${appId}/${side}: ${file} (${name}) is a skeleton element`);
          continue;
        }
        if (claimed.has(file)) {
          problems.push(`${appId}/${side}: ${file} already mapped to ${claimed.get(file)}`);
          continue;
        }
        claimed.set(file, appId);
        rows.push({ appId, side, concept: fileName.get(file), fma: concepts.get(fileName.get(file)).fma, file, status: 'mapped' });
        found++;
      }
    }
    if (!found) problems.push(`${appId}/${side}: no BodyParts3D concept matched ${JSON.stringify(spec)}`);
  }
}

// Unmapped muscle elements stay in the model as neutral, unlisted tissue.
const sideOf = (name) => name.match(/\b(left|right)\b/)?.[1] ?? 'center';
const unlisted = [...muscleFiles].filter((f) => !claimed.has(f));
for (const [files, status] of [
  [unlisted, 'unlisted'],
  [boneFiles, 'skeleton'],
]) {
  for (const file of files) {
    const name = fileName.get(file);
    rows.push({ appId: '', side: sideOf(name), concept: name, fma: concepts.get(name).fma, file, status });
  }
}

const esc = (v) => (/[",\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v);
writeFileSync(
  outCsv,
  [MESH_MAP_HEADER, ...rows.map((r) => [r.appId, r.side, r.concept, r.fma, r.file, r.status].map(esc).join(','))].join('\n') + '\n',
);

// Human-readable table next to the CSV: one row per app muscle id.
const mdRows = Object.keys(MUSCLE_SPEC).map((appId) => {
  const mine = rows.filter((r) => r.appId === appId);
  if (mine[0]?.status === 'generated') return `| \`${appId}\` | not in BodyParts3D | generated by the pipeline |`;
  const names = [...new Set(mine.filter((r) => r.side !== 'right').map((r) => r.concept.replace(/\bleft /, '')))];
  const files = mine.map((r) => r.file).join(', ');
  return `| \`${appId}\` | ${names.join('; ')} | ${files} |`;
});
writeFileSync(
  outCsv.replace(/\.csv$/, '.md'),
  [
    '# Mesh map: BodyParts3D -> app muscle ids',
    '',
    'Generated by `npm run model:map` from the BodyParts3D 4.0 IS-A parts lists. Do not edit by hand.',
    'Concept names are shown without "left"/"right"; each id maps both sides. The full per-file table is `mesh-map.csv`.',
    '',
    '| App muscle id | BodyParts3D concepts | Mesh files (left, right) |',
    '|---|---|---|',
    ...mdRows,
    '',
  ].join('\n'),
);

const count = (s) => rows.filter((r) => r.status === s).length;
console.log(`mapped ${count('mapped')} meshes, generated ${count('generated')} slots, unlisted muscles ${count('unlisted')}, skeleton ${count('skeleton')}`);
if (problems.length) {
  console.log(`\n${problems.length} problem(s):\n` + problems.join('\n'));
  process.exitCode = 1;
}
