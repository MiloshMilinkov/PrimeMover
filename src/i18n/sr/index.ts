/**
 * Serbian (Latin script) dictionary: English text -> Serbian. Loaded only when a
 * visitor picks Srpski. Split by subject so each part stays reviewable.
 * tests/i18n.test.ts checks that every string the app can show is covered.
 */
import { EXERCISES_SR } from './exercises/index';
import { MODEL_SR } from './model';
import { MUSCLES_SR } from './muscles';
import { UI } from './ui';

export const SR: Record<string, string> = { ...MODEL_SR, ...MUSCLES_SR, ...EXERCISES_SR, ...UI };
