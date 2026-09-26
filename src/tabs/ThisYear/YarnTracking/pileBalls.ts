import { YarnBall } from './types';
import { getThisMonth } from '../../../shared/dates';

const MONTHS_UNTIL_GONE = 12;

export type PileBall = { ball: YarnBall; fade?: number };

const getFade = ({ usedIn }: YarnBall, month: Temporal.PlainYearMonth) =>
  usedIn &&
  month.since(usedIn, { largestUnit: 'months' }).months / MONTHS_UNTIL_GONE;

export const getPileBalls = (
  pile: YarnBall[],
  month = getThisMonth(),
): PileBall[] =>
  pile
    .map((ball) => ({ ball, fade: getFade(ball, month) }))
    .filter(({ fade }) => fade === undefined || fade < 1);
