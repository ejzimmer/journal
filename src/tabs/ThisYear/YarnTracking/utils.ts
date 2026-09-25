import { Yarn, History, Month, TotalsByType, YarnType } from './types';

export const getThisMonth = () =>
  Temporal.Now.plainDateISO().toPlainYearMonth();

const getMonthsWithHistory = (history: YarnType['history']) =>
  Object.keys(history)
    .map((month) => Temporal.PlainYearMonth.from(month))
    .sort(Temporal.PlainYearMonth.compare);

export const getLatestBalance = ({ history }: YarnType) => {
  const latestMonth = getMonthsWithHistory(history).at(-1);

  return latestMonth ? history[latestMonth.toString()] : 0;
};

const getFirstMonth = (yarnState: Yarn, thisMonth: Temporal.PlainYearMonth) =>
  Object.values(yarnState)
    .flatMap(({ history }) => getMonthsWithHistory(history))
    .reduce(
      (earliest, month) =>
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

export function getHistoryByMonth(yarnState: Yarn): History {
  const yarnTypes = Object.values(yarnState);
  const thisMonth = getThisMonth();

  const months = getMonthsBetween(
    getFirstMonth(yarnState, thisMonth),
    thisMonth,
  ).reduce<Month[]>((previousMonths, month) => {
    const previousSubTotals = previousMonths.at(-1)?.subTotals ?? {};
    const subTotals = Object.fromEntries(
      yarnTypes.map(({ id, history }) => [
        id,
        history[month.toString()] ?? previousSubTotals[id] ?? 0,
      ]),
    );

    return [
      ...previousMonths,
      { month, total: sumSubTotals(subTotals), subTotals },
    ];
  }, []);

  return Object.fromEntries(
    months.map((month) => [month.month.toString(), month]),
  );
}

export const GRAMS_PER_BALL = 200;

export function getBallSizes(grams: number): number[] {
  const wholeBalls = Math.floor(grams / GRAMS_PER_BALL);
  const remainder = (grams % GRAMS_PER_BALL) / GRAMS_PER_BALL;

  const wholeBallSizes = Array.from({ length: wholeBalls }, () => 1);

  return remainder ? [...wholeBallSizes, remainder] : wholeBallSizes;
}
