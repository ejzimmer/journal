import { YarnBall } from './types';
import { getThisMonth } from '../../../shared/dates';

const MONTHS_TO_FADE_OUT = 12;

export type PileBall = { ball: YarnBall; fade?: number };

const getFade = ({ usedIn }: YarnBall, month: Temporal.PlainYearMonth) =>
  usedIn &&
  month.since(usedIn, { largestUnit: 'months' }).months / MONTHS_TO_FADE_OUT;

export const getPileBalls = (
  pile: YarnBall[],
  month: Temporal.PlainYearMonth,
): PileBall[] => pile.map((ball) => ({ ball, fade: getFade(ball, month) }));

export function getLatestMonthOfYear(year: number) {
  const thisMonth = getThisMonth();
  const december = Temporal.PlainYearMonth.from({ year, month: 12 });
  return Temporal.PlainYearMonth.compare(thisMonth, december) < 0
    ? thisMonth
    : december;
}
