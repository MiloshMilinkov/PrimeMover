/*
 * Prime Mover
 * Copyright (c) 2026 Miloš Milinkov. All rights reserved.
 * Proprietary and confidential. See the LICENSE file.
 *
 * Builds public/models/body-{high,low}.glb from BodyParts3D OBJs + mesh-map.csv.
 * Usage: node pipeline/scripts/build-model.mjs <bp3d dir> <mesh-map.csv> <out dir>
 *
 * Output per GLB:
 *   node "muscles"  : POSITION, NORMAL, _FIBRE (int8 normalized long axis), _SLOT (uint16)
 *   node "skeleton" : POSITION, NORMAL, _PART (uint16, index into parts[])
 *   scene extras    : { howwemove: { version, lod, height, slots[], parts[], credit } }
 * Slots 0..2n-1 are MUSCLE_IDS[i] left (2i) / right (2i+1); later slots are
 * unlisted BodyParts3D muscles shown as neutral tissue.
 */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { Document, NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS, EXTMeshoptCompression } from '@gltf-transform/extensions';
import { quantize, reorder } from '@gltf-transform/functions';
import { MeshoptEncoder, MeshoptSimplifier } from 'meshoptimizer';
import { MUSCLE_IDS } from '../../src/data/schema.ts';
import { bounds, concat, mapPositions, normals, parseObj, principalAxis, simplify, taubin, weld } from './lib/geometry.mjs';
import { generateMuscles } from './lib/generated-muscles.mjs';
import { readMeshMap } from './lib/mesh-map.mjs';

const [srcDir, mapCsv, outDir] = process.argv.slice(2);
if (!srcDir || !mapCsv || !outDir) {
  console.error('usage: build-model.mjs <bp3d dir> <mesh-map.csv> <out dir>');
  process.exit(1);
}
const OBJ_DIR = join(srcDir, 'isa_obj', 'isa_BP3D_4.0_obj_99');

/** Tiny or internal structures nobody sees from outside the body. */
const DROP_MUSCLE = /arytenoid|crico|vocalis|pharyn|palat|uvula|glossus|coccyg|puborectalis|perineal|platysma|^(superior|inferior|medial|lateral) rectus$|^(superior|inferior) oblique$|levator palpebrae|stapedius|tensor tympani/;
const DROP_BONE = /malleus|incus|stapes/;

const LODS = {
  high: { muscle: 0.21, unlisted: 0.08, bone: 0.15, minTris: 160, error: 0.02 },
  low: { muscle: 0.064, unlisted: 0.03, bone: 0.045, minTris: 40, error: 0.08 },
};

const CREDIT = 'BodyParts3D, © The Database Center for Life Science, licensed under CC Attribution 4.0 International';

await MeshoptSimplifier.ready;
await MeshoptEncoder.ready;

/* ---------- which meshes to use ---------- */
const stripSide = (name) => name.replace(/\b(left|right) /, '');
const sources = readMeshMap(mapCsv).filter((r) => {
  if (r.status === 'mapped') return true;
  if (r.status === 'unlisted') return !DROP_MUSCLE.test(stripSide(r.concept));
  if (r.status === 'skeleton') return !DROP_BONE.test(r.concept);
  return false;
});

/* ---------- load, convert (mm Z-up, anterior -Y) -> (m Y-up, anterior +Z) ---------- */
console.log(`loading ${sources.length} meshes…`);
const raw = sources.map((r) => ({ ...r, mesh: weld(parseObj(readFileSync(join(OBJ_DIR, `${r.file}.obj`), 'utf8'))) }));
const all = bounds(...raw.map((r) => r.mesh.positions));
const cx = (all.min[0] + all.max[0]) / 2;
const cy = (all.min[1] + all.max[1]) / 2;
const floor = all.min[2];
const toApp = ([x, y, z]) => [(x - cx) / 1000, (z - floor) / 1000, -(y - cy) / 1000];

for (const r of raw) r.mesh = taubin(mapPositions(r.mesh, toApp), r.status === 'skeleton' ? 1 : 4);
const height = (all.max[2] - all.min[2]) / 1000;
console.log(`model height ${height.toFixed(3)} m`);

/* ---------- generated muscles (missing from BodyParts3D) ---------- */
const generated = generateMuscles(new Map(raw.map((r) => [r.concept, r.mesh])));
for (const { concept, mesh } of generated.replacements) {
  const r = raw.find((x) => x.concept === concept);
  if (!r) throw new Error(`replacement target not found: ${concept}`);
  r.mesh = mesh;
}
for (const g of generated.muscles) {
  raw.push({ appId: g.appId, side: g.side, concept: `(generated) ${g.side} ${g.appId}`, status: 'generated', mesh: taubin(g.mesh, 1), fibre: g.fibre });
}

/* ---------- slots ---------- */
/** Layer of muscles that have no app id (registry muscles carry their own layer). */
const DEEP_UNLISTED =
  /intercostal|rotator|intertransversari|interspinalis|semispinalis|rectus capitis|obliquus capitis|longus (colli|capitis)|transversus thoracis|subclavius|serratus posterior|lumbrical|interosse|adductor (pollicis|hallucis)|opponens/;

const slots = MUSCLE_IDS.flatMap((id) => [
  { id, side: 'left' },
  { id, side: 'right' },
]);
const slotIndex = new Map(); // concept -> slot, for unlisted muscles
const slotOf = (r) => {
  if (r.appId) return MUSCLE_IDS.indexOf(r.appId) * 2 + (r.side === 'right' ? 1 : 0);
  if (!slotIndex.has(r.concept)) {
    const name = stripSide(r.concept);
    slotIndex.set(r.concept, slots.push({ id: null, side: r.side, name, layer: DEEP_UNLISTED.test(name) ? 'deep' : 'intermediate' }) - 1);
  }
  return slotIndex.get(r.concept);
};

/* ---------- build each LOD ---------- */
mkdirSync(outDir, { recursive: true });
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({ 'meshopt.encoder': MeshoptEncoder });

for (const [lodName, lod] of Object.entries(LODS)) {
  const muscle = { pos: [], nrm: [], fib: [], slot: [], idx: [], vcount: 0 };
  const bone = { pos: [], nrm: [], part: [], idx: [], vcount: 0 };
  const parts = [];

  for (const r of raw) {
    const isBone = r.status === 'skeleton';
    const ratio = isBone ? lod.bone : r.status === 'unlisted' ? lod.unlisted : lod.muscle;
    const m = simplify(r.mesh, ratio, lod.minTris, lod.error);
    const target = isBone ? bone : muscle;
    const vcount = m.positions.length / 3;
    target.pos.push(m.positions);
    target.nrm.push(normals(m));
    target.idx.push(m.indices.map((i) => i + target.vcount));
    target.vcount += vcount;
    if (isBone) {
      const p = parts.push({ name: stripSide(r.concept), side: r.side }) - 1;
      bone.part.push(new Uint16Array(vcount).fill(p));
    } else {
      muscle.slot.push(new Uint16Array(vcount).fill(slotOf(r)));
      const fib = new Int8Array(vcount * 3);
      const axis = principalAxis(m.positions);
      for (let i = 0; i < vcount; i++) {
        const f = r.fibre ? r.fibre([m.positions[i * 3], m.positions[i * 3 + 1], m.positions[i * 3 + 2]]) : axis;
        for (let k = 0; k < 3; k++) fib[i * 3 + k] = Math.round(f[k] * 127);
      }
      muscle.fib.push(fib);
    }
  }

  const doc = new Document();
  const buffer = doc.createBuffer();
  const acc = (array, type, normalized = false) =>
    doc.createAccessor().setArray(array).setType(type).setBuffer(buffer).setNormalized(normalized);
  const indices = (t) => concat(t.idx, t.vcount > 65535 ? Uint32Array : Uint16Array);

  const musclePrim = doc
    .createPrimitive()
    .setAttribute('POSITION', acc(concat(muscle.pos, Float32Array), 'VEC3'))
    .setAttribute('NORMAL', acc(concat(muscle.nrm, Float32Array), 'VEC3'))
    .setAttribute('_FIBRE', acc(concat(muscle.fib, Int8Array), 'VEC3', true))
    .setAttribute('_SLOT', acc(concat(muscle.slot, Uint16Array), 'SCALAR'))
    .setIndices(acc(indices(muscle), 'SCALAR'));
  const bonePrim = doc
    .createPrimitive()
    .setAttribute('POSITION', acc(concat(bone.pos, Float32Array), 'VEC3'))
    .setAttribute('NORMAL', acc(concat(bone.nrm, Float32Array), 'VEC3'))
    .setAttribute('_PART', acc(concat(bone.part, Uint16Array), 'SCALAR'))
    .setIndices(acc(indices(bone), 'SCALAR'));

  const scene = doc.createScene('body');
  scene.addChild(doc.createNode('muscles').setMesh(doc.createMesh('muscles').addPrimitive(musclePrim)));
  scene.addChild(doc.createNode('skeleton').setMesh(doc.createMesh('skeleton').addPrimitive(bonePrim)));
  scene.setExtras({ howwemove: { version: 1, lod: lodName, height, slots, parts, credit: CREDIT } });

  await doc.transform(reorder({ encoder: MeshoptEncoder }), quantize({ pattern: /^(POSITION|NORMAL)$/ }));
  doc.createExtension(EXTMeshoptCompression).setRequired(true).setEncoderOptions({ method: EXTMeshoptCompression.EncoderMethod.QUANTIZE });

  const out = join(outDir, `body-${lodName}.glb`);
  const bytes = await io.writeBinary(doc);
  writeFileSync(out, bytes);
  console.log(
    `${lodName}: muscles ${concat(muscle.idx, Uint32Array).length / 3} tris, ` +
      `skeleton ${concat(bone.idx, Uint32Array).length / 3} tris, ${slots.length} slots, ` +
      `${(bytes.length / 1048576).toFixed(2)} MB -> ${out}`,
  );
}
