import { Month, TotalsByType, YarnType } from './types';

export const getThisMonth = () =>
  Temporal.Now.plainDateISO().toPlainYearMonth();

const getFirstMonth = (
  yarnTypes: YarnType[],
  thisMonth: Temporal.PlainYearMonth,
) =>
  yarnTypes
    .flatMap(({ balances }) => balances.slice(0, 1))
    .reduce(
      (earliest, { month }) =>
        Temporal.PlainYearMonth.compare(month, earliest) < 0 ? month : earliest,
      thisMonth.with({ month: 1 }),
    );

const sumSubTotals = (subTotals: TotalsByType) =>
  Object.values(subTotals).reduce((current, total) => total + current, 0);

const getMonthsBetween = (
  first: Temporal.PlainYearMonth,
  last: Temporal.PlainYearMonth,
) =>
  Array.from(
    { length: last.since(first, { largestUnit: 'months' }).months + 1 },
    (_, index) => first.add({ months: index }),
  );

export function getHistoryByMonth(yarnTypes: YarnType[]): Month[] {
  const thisMonth = getThisMonth();

  return getMonthsBetween(
    getFirstMonth(yarnTypes, thisMonth),
    thisMonth,
  ).reduce<Month[]>((previousMonths, month) => {
    const previousSubTotals = previousMonths.at(-1)?.subTotals ?? {};
    const subTotals = Object.fromEntries(
      yarnTypes.map(({ id, balances }) => [
        id,
        balances.find((balance) => balance.month.equals(month))?.grams ??
          previousSubTotals[id] ??
          0,
      ]),
    );

    return [
      ...previousMonths,
      { month, total: sumSubTotals(subTotals), subTotals },
    ];
  }, []);
}

export const GRAMS_PER_BALL = 200;

export function getBallSizes(grams: number): number[] {
  const wholeBalls = Math.floor(grams / GRAMS_PER_BALL);
  const remainder = (grams % GRAMS_PER_BALL) / GRAMS_PER_BALL;

  const wholeBallSizes = Array.from({ length: wholeBalls }, () => 1);

  return remainder ? [...wholeBallSizes, remainder] : wholeBallSizes;
}
