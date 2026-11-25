import { MUSCLE_BY_ID } from '../data/muscles';
import { NEUTRAL_CODE, ROLE_BY_NAME, TIER_LEVEL } from '../data/roles';
import type { MuscleId, MuscleLayer } from '../data/schema';
import type { Depth, LayerMode, ModelSlot } from '../state/viewer';
import { involvementKey, type InvolvementMap } from './involvement';

const LAYER_DEPTH: Record<MuscleLayer, number> = { superficial: 0, intermediate: 1, deep: 2 };

/** Registry muscles carry their layer; unlisted ones get it from the pipeline. */
const slotLayer = (slot: ModelSlot): MuscleLayer => (slot.id ? MUSCLE_BY_ID[slot.id].layer : (slot.layer ?? 'intermediate'));

export interface SlotStateInput {
  slots: ModelSlot[];
  layerMode: LayerMode;
  depth: Depth;
  hoverSlot: number | null;
  /** Muscle previewed from a list: highlighted on both sides like a hover. */
  preview: MuscleId | null;
  selected: MuscleId | null;
  /** Active exercise's roles; null when browsing without an exercise. */
  involvement: InvolvementMap | null;
}

/** Byte values written to the state texture (see materials.ts). */
export const OPAQUE = 255;
export const TRANSLUCENT = 110;
export const HOVER_FLAG = 128;
export const SELECTED_FLAG = 255;

/**
 * Writes the RGBA state for every slot into `out` (length slots * 4) and reports
 * whether any slot needs the translucent pass.
 *
 * Without an exercise every shown muscle is opaque tissue (x-ray: the outermost
 * shown layer goes see-through). With an exercise, involved muscles are opaque in
 * their role colour; the rest turn grey and see-through on the outermost shown
 * layer and hide below it, so the skeleton and the working muscles show through.
 */
export function computeSlotState(input: SlotStateInput, out: Uint8Array): { anyTranslucent: boolean } {
  const { slots, layerMode, depth, hoverSlot, preview, selected, involvement } = input;
  let anyTranslucent = false;
  for (let i = 0; i < slots.length; i++) {
    const slot = slots[i];
    const isSelected = selected !== null && slot.id === selected;
    const isHovered = hoverSlot === i || (preview !== null && slot.id === preview);
    const layer = LAYER_DEPTH[slotLayer(slot)];
    const involved = involvement && slot.id ? involvement.get(involvementKey(slot.id, slot.side)) : undefined;
    // See-through rule: x-ray without an exercise, or uninvolved muscles with one.
    const seeThrough = involvement ? !involved : layerMode === 'xray';

    let alpha = OPAQUE;
    if (layerMode === 'skeleton' || layer < depth) alpha = 0;
    else if (seeThrough && !isSelected && !isHovered) alpha = layer === depth ? TRANSLUCENT : 0;
    if (alpha > 0 && alpha < OPAQUE) anyTranslucent = true;

    out[i * 4] = involved ? ROLE_BY_NAME[involved.role].code : involvement ? NEUTRAL_CODE : 0;
    out[i * 4 + 1] = involved ? Math.round(TIER_LEVEL[involved.tier] * 255) : 0;
    out[i * 4 + 2] = alpha;
    out[i * 4 + 3] = alpha === 0 ? 0 : isSelected ? SELECTED_FLAG : isHovered ? HOVER_FLAG : 0;
  }
  return { anyTranslucent };
}
