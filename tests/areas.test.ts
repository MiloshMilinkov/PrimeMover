import { describe, expect, it } from 'vitest';
import { EXERCISE_BY_ID, EXERCISES } from '../src/data/exercises';
import { MUSCLE_IDS } from '../src/data/schema';
import { areaOf, mainAreas } from '../src/lib/areas';

describe('friendly muscle areas', () => {
  it('gives every muscle a lower-case area name', () => {
    for (const id of MUSCLE_IDS) expect(areaOf(id)).toMatch(/^[a-z][a-z ]+$/);
  });

  it('uses gym names for common muscles', () => {
    expect(areaOf('vastus-lateralis')).toBe('quads');
    expect(areaOf('semitendinosus')).toBe('hamstrings');
    expect(areaOf('latissimus-dorsi')).toBe('lats');
    expect(areaOf('deltoid-posterior')).toBe('rear shoulders');
  });

  it('names the main areas of every exercise, so list rows and summaries are never empty', () => {
    expect(EXERCISES.filter((e) => mainAreas(e).length === 0).map((e) => e.id)).toEqual([]);
    expect(mainAreas(EXERCISE_BY_ID['barbell-bench-press'])).toContain('chest');
  });
});
