import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { MUSCLE_BY_ID, MUSCLES } from '../src/data/muscles';
import { MUSCLE_IDS } from '../src/data/schema';
import { readMeshMap } from '../pipeline/scripts/lib/mesh-map.mjs';

const csv = readMeshMap(fileURLToPath(new URL('../pipeline/mesh-map.csv', import.meta.url)));

describe('muscle registry', () => {
  it('has exactly one entry per muscle id', () => {
    expect(MUSCLES.map((m) => m.id).sort()).toEqual([...MUSCLE_IDS].sort());
    expect(new Set(MUSCLE_IDS).size).toBe(MUSCLE_IDS.length);
  });

  it('describes every muscle', () => {
    for (const m of MUSCLES) {
      expect(m.name, m.id).not.toBe('');
      expect(m.function.length, m.id).toBeGreaterThan(20);
      expect(m.origin, m.id).not.toBe('');
      expect(m.insertion, m.id).not.toBe('');
    }
  });
});

describe('mesh map', () => {
  it('gives every muscle id geometry on both sides (or the midline)', () => {
    for (const id of MUSCLE_IDS) {
      const rows = csv.filter((r) => r.appId === id && (r.status === 'mapped' || r.status === 'generated'));
      const sides = new Set(rows.map((r) => r.side));
      if (sides.has('center')) continue; // the diaphragm is one midline sheet
      expect([...sides].sort(), `${id} (${MUSCLE_BY_ID[id].name})`).toEqual(['left', 'right']);
    }
  });

  it('never maps one mesh file to two places', () => {
    const files = csv.filter((r) => r.file).map((r) => r.file);
    expect(new Set(files).size).toBe(files.length);
  });
});
