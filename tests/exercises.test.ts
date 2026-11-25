import { describe, expect, it } from 'vitest';
import { EXERCISES, EXERCISE_BY_ID } from '../src/data/exercises';
import { SOURCE_BY_ID, SOURCES } from '../src/data/sources';

describe('exercise library', () => {
  it('has at least 30 exercises with unique kebab-case ids', () => {
    expect(EXERCISES.length).toBeGreaterThanOrEqual(30);
    const ids = EXERCISES.map((e) => e.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const id of ids) expect(id).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
  });

  it.each(EXERCISES.map((e) => [e.id, e] as const))('%s is complete and consistent', (_, e) => {
    expect(e.muscles.some((m) => m.role === 'prime' || m.role === 'lengthening'), 'needs a prime mover').toBe(true);
    const keys = e.muscles.map((m) => `${m.id}/${m.side ?? 'both'}`);
    expect(new Set(keys).size, 'muscle listed twice').toBe(keys.length);
    for (const m of e.muscles) expect(m.note.length, m.id).toBeGreaterThan(8);
    expect(e.phases.length).toBeGreaterThan(0);
    expect(e.cues.length).toBeGreaterThanOrEqual(1);
    expect(e.mistakes.length).toBeGreaterThanOrEqual(1);
    expect(e.variations.length).toBeGreaterThanOrEqual(1);
    const cited = [...e.sourceIds, ...e.muscles.flatMap((m) => m.sourceIds ?? [])];
    expect(e.sourceIds.length).toBeGreaterThan(0);
    for (const s of cited) expect(SOURCE_BY_ID[s], `unknown source ${s}`).toBeDefined();
    for (const v of e.variations) {
      if (!v.exerciseId) continue;
      expect(v.exerciseId).not.toBe(e.id);
      expect(EXERCISE_BY_ID[v.exerciseId], `unknown variation ${v.exerciseId}`).toBeDefined();
    }
    if (e.laterality === 'bilateral') expect(e.muscles.every((m) => !m.side || m.side === 'both')).toBe(true);
  });

  it('cites every source at least once and none twice in the list', () => {
    const used = new Set(EXERCISES.flatMap((e) => [...e.sourceIds, ...e.muscles.flatMap((m) => m.sourceIds ?? [])]));
    expect(SOURCES.filter((s) => !used.has(s.id)).map((s) => s.id)).toEqual([]);
    expect(new Set(SOURCES.map((s) => s.id)).size).toBe(SOURCES.length);
  });
});
