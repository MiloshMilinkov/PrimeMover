/**
 * Every English string the app can show must have a Serbian translation.
 * Sources: t('...'), n(x, '...', '...') and msg('...') literals in src/, the label
 * tables, the exercise and muscle data, and the bone and muscle names inside the model.
 * Exercise aliases stay English on purpose (they are gym terms and stay searchable).
 *
 * To list what is missing: I18N_MISSING=path/to/missing.json npx vitest run tests/i18n.test.ts
 */
import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { MeshoptDecoder } from 'meshoptimizer';
import { readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { EXERCISES } from '../src/data/exercises';
import * as labels from '../src/data/labels';
import { MUSCLES } from '../src/data/muscles';
import { ROLES, TIER_LABEL } from '../src/data/roles';
import { MUSCLE_IDS } from '../src/data/schema';
import { SR } from '../src/i18n/sr';
import { areaOf } from '../src/lib/areas';

const files = (dir: string): string[] =>
  readdirSync(dir).flatMap((f) => {
    const p = join(dir, f);
    // src/i18n holds the dictionaries and usage examples in comments, not app strings.
    return statSync(p).isDirectory() ? (f === 'i18n' ? [] : files(p)) : /\.tsx?$/.test(f) ? [p] : [];
  });

/** The literal inside a quoted JS string, with \' and \" unescaped. */
const unquote = (s: string) => s.slice(1, -1).replace(/\\(['"\\])/g, '$1');
const STR = String.raw`('(?:[^'\\]|\\.)*'|"(?:[^"\\]|\\.)*")`;

function uiStrings() {
  const keys = new Set<string>();
  for (const f of files('src')) {
    const src = readFileSync(f, 'utf8');
    for (const m of src.matchAll(new RegExp(String.raw`\b(?:t|msg)\(\s*` + STR, 'g'))) keys.add(unquote(m[1]));
    for (const m of src.matchAll(new RegExp(String.raw`\bn\([^,]+,\s*` + STR + String.raw`\s*,\s*` + STR, 'g'))) {
      keys.add(`${unquote(m[1])}|${unquote(m[2])}`);
    }
  }
  return keys;
}

function dataStrings() {
  const keys = new Set<string>();
  const add = (s?: string) => s && keys.add(s);
  for (const table of [labels.CATEGORY_LABEL, labels.EQUIPMENT_LABEL, labels.DIFFICULTY_LABEL, labels.MUSCLE_GROUP_LABEL, labels.JOINT_LABEL, labels.SIDE_LABEL, labels.PHASE_KIND_LABEL, TIER_LABEL]) {
    Object.values(table).forEach((v) => add(v));
  }
  Object.values(labels.EVIDENCE_LABEL).forEach((v) => [v.title, v.badge, v.detail].forEach(add));
  ROLES.forEach((r) => [r.label, r.shortLabel, r.description].forEach(add));
  MUSCLE_IDS.forEach((id) => add(areaOf(id)));
  for (const m of MUSCLES) [m.name, m.parent, m.function, m.origin, m.insertion].forEach(add);
  for (const e of EXERCISES) {
    [e.name, e.notes, ...e.cues].forEach(add);
    e.mistakes.forEach((x) => [x.mistake, x.fix].forEach(add));
    e.variations.forEach((v) => [v.name, v.emphasisShift].forEach(add));
    e.phases.forEach((p) => add(p.label));
    e.muscles.forEach((m) => [m.note, m.notes].forEach(add));
  }
  return keys;
}

/** Bone names, unlisted muscle names and the credit note stored in the model files. */
async function modelStrings() {
  await MeshoptDecoder.ready;
  const io = new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({ 'meshopt.decoder': MeshoptDecoder });
  const keys = new Set<string>();
  for (const file of ['body-low.glb', 'body-female-low.glb']) {
    const root = (await io.read(`public/models/${file}`)).getRoot();
    const meta = (root.listScenes()[0].getExtras() as { howwemove: { slots: { name?: string }[]; parts: { name: string }[]; note?: string } }).howwemove;
    meta.slots.forEach((s) => s.name && keys.add(s.name));
    meta.parts.forEach((p) => keys.add(p.name));
    if (meta.note) keys.add(meta.note);
  }
  return keys;
}

describe('Serbian translation', () => {
  it('covers every string the app can show', async () => {
    const groups = { ui: uiStrings(), data: dataStrings(), model: await modelStrings() };
    const missing = Object.fromEntries(Object.entries(groups).map(([g, keys]) => [g, [...keys].filter((k) => !SR[k]?.trim())]));
    if (process.env.I18N_MISSING) writeFileSync(process.env.I18N_MISSING, JSON.stringify(missing, null, 1));
    expect(missing).toEqual({ ui: [], data: [], model: [] });
  });

  it('keeps placeholders and plural forms intact', () => {
    for (const [en, sr] of Object.entries(SR)) {
      const vars = (s: string) => [...s.matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort();
      if (en.includes('|')) {
        const forms = sr.split('|');
        expect(forms, en).toHaveLength(3);
        for (const f of forms) expect(vars(f), en).toEqual(vars(en.split('|')[0]));
      } else {
        expect(vars(sr), en).toEqual(vars(en));
      }
    }
  });
});
