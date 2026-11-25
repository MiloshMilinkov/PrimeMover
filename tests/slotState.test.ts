import { describe, expect, it } from 'vitest';
import { computeSlotState, HOVER_FLAG, OPAQUE, SELECTED_FLAG, TRANSLUCENT, type SlotStateInput } from '../src/lib/slotState';
import type { ModelSlot } from '../src/state/viewer';
import { EXERCISE_BY_ID } from '../src/data/exercises';
import { NEUTRAL_CODE, ROLE_BY_NAME, TIER_LEVEL } from '../src/data/roles';
import type { Exercise } from '../src/data/schema';
import { involvementFor, WORKING_SIDE } from '../src/lib/involvement';

// deltoid-anterior is superficial, brachialis intermediate, supraspinatus deep.
const slots: ModelSlot[] = [
  { id: 'deltoid-anterior', side: 'left' },
  { id: 'deltoid-anterior', side: 'right' },
  { id: 'brachialis', side: 'left' },
  { id: 'supraspinatus', side: 'left' },
  { id: null, side: 'left', name: 'external intercostal muscle', layer: 'deep' },
];

const run = (over: Partial<SlotStateInput>) => {
  const out = new Uint8Array(slots.length * 4);
  computeSlotState({ slots, layerMode: 'full', depth: 0, hoverSlot: null, preview: null, selected: null, involvement: null, ...over }, out);
  const role = (i: number) => out[i * 4];
  const level = (i: number) => out[i * 4 + 1];
  const alpha = (i: number) => out[i * 4 + 2];
  const flag = (i: number) => out[i * 4 + 3];
  return { role, level, alpha, flag };
};

// The front deltoid is the prime mover on the working side only; the brachialis
// is a low-tier synergist on both sides.
const exercise: Exercise = {
  ...EXERCISE_BY_ID['barbell-curl'],
  laterality: 'unilateral',
  muscles: [
    { id: 'deltoid-anterior', role: 'prime', tier: 'high', note: 'Test prime mover.', side: 'working' },
    { id: 'brachialis', role: 'synergist', tier: 'low', note: 'Test synergist.' },
  ],
};
const working = slots.findIndex((s) => s.id === 'deltoid-anterior' && s.side === WORKING_SIDE);
const other = slots.findIndex((s) => s.id === 'deltoid-anterior' && s.side !== WORKING_SIDE);

describe('computeSlotState with an exercise', () => {
  const involvement = involvementFor(exercise);

  it('colours involved muscles by role and tier on the working side only', () => {
    const { role, level, alpha } = run({ involvement });
    expect(role(working)).toBe(ROLE_BY_NAME.prime.code);
    expect(level(working)).toBe(Math.round(TIER_LEVEL.high * 255));
    expect(alpha(working)).toBe(OPAQUE);
    expect(role(2)).toBe(ROLE_BY_NAME.synergist.code); // brachialis (intermediate layer)
    expect(alpha(2)).toBe(OPAQUE);
  });

  it('turns uninvolved outer muscles grey and see-through and hides deeper ones', () => {
    const { role, alpha } = run({ involvement });
    expect(role(other)).toBe(NEUTRAL_CODE);
    expect(alpha(other)).toBe(TRANSLUCENT);
    expect(alpha(3)).toBe(0); // supraspinatus: deep and uninvolved
  });
});

describe('computeSlotState', () => {
  it('shows every muscle opaque in the full body view', () => {
    const { alpha } = run({});
    expect(slots.map((_, i) => alpha(i))).toEqual(slots.map(() => OPAQUE));
  });

  it('hides all muscles in skeleton mode', () => {
    const { alpha } = run({ layerMode: 'skeleton', selected: 'brachialis' });
    expect(slots.map((_, i) => alpha(i))).toEqual(slots.map(() => 0));
  });

  it('peels layers from the outside in', () => {
    const peel1 = run({ depth: 1 });
    expect(peel1.alpha(0)).toBe(0);
    expect(peel1.alpha(2)).toBe(OPAQUE);
    const peel2 = run({ depth: 2 });
    expect(peel2.alpha(2)).toBe(0);
    expect(peel2.alpha(3)).toBe(OPAQUE);
    expect(peel2.alpha(4)).toBe(OPAQUE); // intercostals count as deep
  });

  it('x-ray turns only the outermost shown layer see-through', () => {
    const { alpha } = run({ layerMode: 'xray' });
    expect(alpha(0)).toBe(TRANSLUCENT);
    expect(alpha(2)).toBe(0);
    const peeled = run({ layerMode: 'xray', depth: 1 });
    expect(peeled.alpha(2)).toBe(TRANSLUCENT);
  });

  it('keeps a selected muscle solid in x-ray, on both sides', () => {
    const { alpha, flag } = run({ layerMode: 'xray', selected: 'brachialis' });
    expect(alpha(2)).toBe(OPAQUE);
    expect(flag(2)).toBe(SELECTED_FLAG);
  });

  it('flags hover on one slot and list preview on both sides', () => {
    const hover = run({ hoverSlot: 1 });
    expect(hover.flag(0)).toBe(0);
    expect(hover.flag(1)).toBe(HOVER_FLAG);
    const preview = run({ preview: 'deltoid-anterior' });
    expect(preview.flag(0)).toBe(HOVER_FLAG);
    expect(preview.flag(1)).toBe(HOVER_FLAG);
  });
});
