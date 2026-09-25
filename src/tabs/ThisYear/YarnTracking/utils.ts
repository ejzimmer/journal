import { YarnBall, YarnType, YarnTypeBalance } from './types';

export const getThisMonth = () =>
  Temporal.Now.plainDateISO().toPlainYearMonth();

export const GRAMS_PER_BALL = 200;

export function getBallSizes(grams: number): number[] {
  const wholeBalls = Math.floor(grams / GRAMS_PER_BALL);
  const remainder = (grams % GRAMS_PER_BALL) / GRAMS_PER_BALL;

  const wholeBallSizes = Array.from({ length: wholeBalls }, () => 1);

  return remainder ? [...wholeBallSizes, remainder] : wholeBallSizes;
}

const getBalanceChanges = (yarnTypes: YarnType[]) =>
  yarnTypes
    .flatMap(({ id, balances }) =>
      balances.map(({ month, grams }, index) => ({
        yarnType: id,
        month,
        grams,
        change: grams - (balances[index - 1]?.grams ?? 0),
      })),
    )
    .sort(
      (a, b) =>
        Temporal.PlainYearMonth.compare(a.month, b.month) ||
        a.change - b.change,
    );

export const buildYarnPile = (yarnTypes: YarnType[]): YarnBall[] =>
  getBalanceChanges(yarnTypes).reduce(applyBalanceToPile, []);

function applyBalanceToPile(
  pile: YarnBall[],
  { yarnType, grams, month }: YarnTypeBalance,
): YarnBall[] {
  const sizes = getBallSizes(grams);

  const inStash = pile
    .filter((ball) => ball.yarnType === yarnType && !ball.usedIn)
    .sort((a, b) => b.size - a.size);
  const kept = inStash.slice(0, sizes.length);
  const usedUp = inStash.slice(sizes.length);

  const restocked = pile
    .filter((ball) => ball.usedIn)
    .sort((a, b) => Temporal.PlainYearMonth.compare(b.usedIn!, a.usedIn!))
    .slice(0, sizes.length - kept.length);

  const updatedBalls = new Map<YarnBall, YarnBall>([
    ...usedUp.map((ball) => [ball, { ...ball, usedIn: month }] as const),
    ...[...kept, ...restocked].map(
      (ball, index) => [ball, { yarnType, size: sizes[index] }] as const,
    ),
  ]);

  const newBalls = sizes
    .slice(kept.length + restocked.length)
    .map((size) => ({ yarnType, size }));

  return [...pile.map((ball) => updatedBalls.get(ball) ?? ball), ...newBalls];
}
