import type { ModelSide, ViewPreset } from '../state/viewer';

export const BASE_FOV = 30;
export const TARGET_Y = 0.9;
const EYE_Y = TARGET_Y + 0.1;
const DISTANCE = 4.1;

export const PRESETS: Record<ViewPreset, [number, number, number]> = {
  front: [0, EYE_Y, DISTANCE],
  back: [0, EYE_Y, -DISTANCE],
  side: [DISTANCE, EYE_Y, 0],
};

/** The model side the 'side' preset looks at (+X is the subject's left). One-sided lifts work this side. */
export const SIDE_PRESET_FACES: ModelSide = 'left';

/** Camera azimuth and polar angle of a preset, as CameraControls measures them. */
export function presetAngles(preset: ViewPreset) {
  const [x, y, z] = PRESETS[preset];
  return { azimuth: Math.atan2(x, z), polar: Math.atan2(Math.hypot(x, z), y - TARGET_Y) };
}

/** Half the body's width (arms included), in metres. */
const BODY_HALF_WIDTH = 0.28;

/** On-screen half-width of the body at a preset's framing, for a canvas `height` px tall. */
export const bodyHalfWidthPx = (height: number) =>
  (BODY_HALF_WIDTH / (2 * DISTANCE * Math.tan((BASE_FOV * Math.PI) / 360))) * height;
