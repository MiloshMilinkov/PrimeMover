import type { MuscleRole, Tier } from './schema';

export interface RoleStyle {
  role: MuscleRole;
  /** Value written to the state texture's R channel; 0 = no role, NEUTRAL_CODE = uninvolved. */
  code: number;
  label: string;
  shortLabel: string;
  /** One plain sentence for people new to the terms. */
  description: string;
  color: string;
  /** Pattern drawn on the model and in the legend, so roles never rely on hue alone. */
  pattern: 'solid' | 'stripes' | 'dots' | 'bands';
  /** Emissive strength at the highest tier: prime movers glow most. */
  glow: number;
}

/** Role colours and patterns, shared by the muscle shader and the legend. */
export const ROLES: RoleStyle[] = [
  { role: 'prime', code: 1, label: 'Prime mover', shortLabel: 'Prime', description: 'Does most of the work.', color: '#e0413a', pattern: 'solid', glow: 0.3 },
  { role: 'synergist', code: 2, label: 'Synergist', shortLabel: 'Synergist', description: 'Helps the prime movers.', color: '#f08a2c', pattern: 'stripes', glow: 0.06 },
  { role: 'stabilizer', code: 3, label: 'Stabilizer', shortLabel: 'Stabilizer', description: 'Holds joints steady so the movers can work.', color: '#e9c046', pattern: 'dots', glow: 0.06 },
  { role: 'lengthening', code: 4, label: 'Lengthening under load', shortLabel: 'Lengthening', description: 'Stretches while it works, often a big part of what the exercise trains.', color: '#4fa3e0', pattern: 'bands', glow: 0.14 },
];

export const ROLE_BY_NAME = Object.fromEntries(ROLES.map((r) => [r.role, r])) as Record<MuscleRole, RoleStyle>;

/** Code for muscles an exercise does not use: drawn see-through and grey. */
export const NEUTRAL_CODE = 5;
export const NEUTRAL_COLOR = '#8f989c';

/** Tier -> intensity (0..1) for colour saturation and glow. */
export const TIER_LEVEL: Record<Tier, number> = { high: 1, moderate: 0.66, low: 0.36 };
export const TIER_LABEL: Record<Tier, string> = { high: 'High', moderate: 'Moderate', low: 'Low' };

/** CSS background that mirrors the shader pattern, for legend swatches. */
export function patternCss(r: RoleStyle) {
  const dark = 'rgb(0 0 0 / 0.38)';
  switch (r.pattern) {
    case 'solid':
      return r.color;
    case 'stripes':
      return `repeating-linear-gradient(45deg, ${r.color} 0 3px, color-mix(in srgb, ${r.color}, black 38%) 3px 6px)`;
    case 'dots':
      return `radial-gradient(circle, ${dark} 1.3px, transparent 1.6px) 0 0 / 5px 5px, ${r.color}`;
    case 'bands':
      return `repeating-linear-gradient(0deg, ${r.color} 0 3px, color-mix(in srgb, ${r.color}, black 38%) 3px 5px)`;
  }
}
