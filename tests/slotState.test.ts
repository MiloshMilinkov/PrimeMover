import { describe, expect, it } from 'vitest';
import { computeSlotState, HOVER_FLAG, OPAQUE, SELECTED_FLAG, TRANSLUCENT, type SlotStateInput } from '../src/lib/slotState';
import type { ModelSlot } from '../src/state/viewer';

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
  computeSlotState({ slots, layerMode: 'full', depth: 0, hoverSlot: null, preview: null, selected: null, ...over }, out);
  const alpha = (i: number) => out[i * 4 + 2];
  const flag = (i: number) => out[i * 4 + 3];
  return { alpha, flag };
};

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
