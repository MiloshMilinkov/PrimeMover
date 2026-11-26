import type { ViewPreset } from '../state/viewer';
import { msg } from '../i18n';

/** Camera presets and their keyboard shortcuts. */
export const VIEWS: { value: ViewPreset; label: string; key: string }[] = [
  { value: 'front', label: msg('view::Front'), key: '1' },
  { value: 'back', label: msg('view::Back'), key: '2' },
  { value: 'side', label: msg('view::Side'), key: '3' },
];
