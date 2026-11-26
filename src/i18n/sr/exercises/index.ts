/** Serbian (latinica) exercise text, one file per exercise data file in src/data/exercises. */
import { dict } from '../dict';
import { BACK_SR } from './back';
import { CHEST_SR } from './chest';
import { LEGS_SR } from './legs';
import { LOWER_BODY_SR } from './lower-body';
import { MOBILITY_SR } from './mobility';
import { POWER_SR } from './power';
import { TRUNK_SR } from './trunk';
import { UPPER_BODY_SR } from './upper-body';
import { UPPER_SR } from './upper';

// Merged through dict() so a text translated differently in two files fails loudly.
export const EXERCISES_SR = dict(
  [LEGS_SR, LOWER_BODY_SR, CHEST_SR, BACK_SR, UPPER_SR, UPPER_BODY_SR, TRUNK_SR, POWER_SR, MOBILITY_SR].flatMap((d) => Object.entries(d)),
);
