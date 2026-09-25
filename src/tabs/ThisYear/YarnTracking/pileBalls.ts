import { YarnBall } from './types';
import { getThisMonth } from '../../../shared/dates';

const MONTHS_UNTIL_GONE = 12;

export type PileBall = { ball: YarnBall; fade?: number };

const getFade = ({ usedIn }: YarnBall) =>
  usedIn &&
  getThisMonth().since(usedIn, { largestUnit: 'months' }).months /
    MONTHS_UNTIL_GONE;

export const getPileBalls = (pile: YarnBall[]): PileBall[] =>
  pile
    .map((ball) => ({ ball, fade: getFade(ball) }))
    .filter(({ fade }) => fade === undefined || fade < 1);
