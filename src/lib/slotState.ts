import { MUSCLE_BY_ID } from '../data/muscles';
import type { MuscleId, MuscleLayer } from '../data/schema';
import type { Depth, LayerMode, ModelSlot } from '../state/viewer';

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
}

/** Byte values written to the state texture (see materials.ts). */
export const OPAQUE = 255;
export const TRANSLUCENT = 110;
export const HOVER_FLAG = 128;
export const SELECTED_FLAG = 255;

/**
 * Writes the target RGBA state for every slot into `out` (length slots * 4) and
 * reports whether any slot needs the translucent pass. Role channels (R, G) stay
 * 0 until exercises drive them in step 3.
 */
export function computeSlotState(input: SlotStateInput, out: Uint8Array): { anyTranslucent: boolean } {
  const { slots, layerMode, depth, hoverSlot, preview, selected } = input;
  let anyTranslucent = false;
  for (let i = 0; i < slots.length; i++) {
    const slot = slots[i];
    const isSelected = selected !== null && slot.id === selected;
    const isHovered = hoverSlot === i || (preview !== null && slot.id === preview);
    const layer = LAYER_DEPTH[slotLayer(slot)];

    let alpha = OPAQUE;
    if (layerMode === 'skeleton' || layer < depth) alpha = 0;
    else if (layerMode === 'xray') {
      // Only the outermost shown layer turns see-through; layers under it would stack
      // into an opaque murk, so they hide unless selected or hovered.
      if (isSelected || isHovered) alpha = OPAQUE;
      else alpha = layer === depth ? TRANSLUCENT : 0;
    }
    if (alpha > 0 && alpha < OPAQUE) anyTranslucent = true;

    out[i * 4] = 0;
    out[i * 4 + 1] = 0;
    out[i * 4 + 2] = alpha;
    out[i * 4 + 3] = alpha === 0 ? 0 : isSelected ? SELECTED_FLAG : isHovered ? HOVER_FLAG : 0;
  }
  return { anyTranslucent };
}
