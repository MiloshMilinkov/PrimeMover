import type { ViewPreset } from '../state/viewer';

export const BASE_FOV = 30;
export const TARGET_Y = 0.9;
const EYE_Y = TARGET_Y + 0.1;
const DISTANCE = 4.1;

export const PRESETS: Record<ViewPreset, [number, number, number]> = {
  front: [0, EYE_Y, DISTANCE],
  back: [0, EYE_Y, -DISTANCE],
  side: [DISTANCE, EYE_Y, 0],
};

/** Half the body's width (arms included), in metres. */
const BODY_HALF_WIDTH = 0.28;

/** On-screen half-width of the body at a preset's framing, for a canvas `height` px tall. */
export const bodyHalfWidthPx = (height: number) =>
  (BODY_HALF_WIDTH / (2 * DISTANCE * Math.tan((BASE_FOV * Math.PI) / 360))) * height;
