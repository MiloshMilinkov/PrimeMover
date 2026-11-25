import type { MuscleRole } from './schema';

/**
 * Role colours, shared by the muscle shader and (from step 3) the legend.
 * `code` is the value written to the state texture's R channel; 0 means no role.
 */
export const ROLES: { role: MuscleRole; code: number; label: string; color: string }[] = [
  { role: 'prime', code: 1, label: 'Prime mover', color: '#e0413a' },
  { role: 'synergist', code: 2, label: 'Synergist', color: '#f08a2c' },
  { role: 'stabilizer', code: 3, label: 'Stabilizer', color: '#e9c046' },
  { role: 'lengthening', code: 4, label: 'Lengthening under load', color: '#4fa3e0' },
];
