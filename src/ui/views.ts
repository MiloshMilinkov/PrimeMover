import type { ViewPreset } from '../state/viewer';

/** Camera presets and their keyboard shortcuts. */
export const VIEWS: { value: ViewPreset; label: string; key: string }[] = [
  { value: 'front', label: 'Front', key: '1' },
  { value: 'back', label: 'Back', key: '2' },
  { value: 'side', label: 'Side', key: '3' },
];
