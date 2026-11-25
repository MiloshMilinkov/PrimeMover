import { describe, expect, it } from 'vitest';
import { EXERCISES } from '../src/data/exercises';
import { NO_FILTERS, queryParts, searchExercises } from '../src/lib/search';

const ids = (query: string, filters = NO_FILTERS) => searchExercises(query, filters).map((e) => e.id);

describe('searchExercises', () => {
  it.each([
    ['RDL', 'romanian-deadlift'],
    ['skull crusher', 'lying-triceps-extension'],
    ['OHP', 'overhead-press'],
    ['bench', 'barbell-bench-press'],
    ['pullup', 'pull-up'],
    ['kb swing', 'kettlebell-swing'],
    ['hip thrust', 'barbell-hip-thrust'],
  ])('finds %s by name or alias', (query, id) => {
    expect(ids(query)[0]).toBe(id);
  });

  it('puts both sides of "X vs Y" first', () => {
    expect(queryParts('pull-up vs chin-up')).toEqual(['pull-up', 'chin-up']);
    expect(ids('pull-up vs chin-up').slice(0, 2)).toEqual(['pull-up', 'chin-up']);
    expect(ids('Front squat versus back squat').slice(0, 2)).toEqual(['barbell-front-squat', 'barbell-back-squat']);
  });

  it('finds exercises by a muscle they work', () => {
    expect(ids('latissimus')).toContain('pull-up');
  });

  it('applies filters with and without a query', () => {
    const kettlebell = searchExercises('', { ...NO_FILTERS, equipment: 'kettlebell' });
    expect(kettlebell.map((e) => e.id)).toEqual(expect.arrayContaining(['kettlebell-swing', 'kettlebell-snatch', 'turkish-get-up']));
    expect(kettlebell.every((e) => e.equipment.includes('kettlebell'))).toBe(true);
    expect(ids('', { ...NO_FILTERS, muscle: 'latissimus-dorsi' })).toEqual(expect.arrayContaining(['pull-up', 'lat-pulldown', 'barbell-bent-over-row']));
    expect(ids('', { ...NO_FILTERS, muscle: 'latissimus-dorsi' })).not.toContain('barbell-back-squat');
    expect(ids('', { ...NO_FILTERS, category: 'calisthenics' })).toEqual(expect.arrayContaining(['push-up', 'pull-up']));
    const advanced = searchExercises('squat', { ...NO_FILTERS, difficulty: 'advanced' });
    expect(advanced.map((e) => e.id)).toContain('barbell-front-squat');
    expect(advanced.every((e) => e.difficulty === 'advanced')).toBe(true);
  });

  it('returns everything for an empty query', () => {
    expect(ids('')).toHaveLength(EXERCISES.length);
  });
});

describe('search precision', () => {
  const named = (e: { name: string; aliases: string[] }, word: string) =>
    [e.name, ...e.aliases].some((n) => n.toLowerCase().includes(word.toLowerCase()));

  it.each(['RDL', 'OHP', 'curl', 'squat', 'row', 'press'])('only returns exercises named or aliased %s', (query) => {
    const hits = searchExercises(query);
    expect(hits.length).toBeGreaterThan(0);
    expect(hits.filter((e) => !named(e, query)).map((e) => e.id)).toEqual([]);
  });
});
