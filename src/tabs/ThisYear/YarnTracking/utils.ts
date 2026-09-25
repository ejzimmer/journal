import { YarnBall, YarnType } from './types';

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

export function buildYarnPile(yarnTypes: YarnType[]): YarnBall[] {
  const pile: YarnBall[] = [];

  getBalanceChanges(yarnTypes).forEach(({ yarnType, grams, month }) => {
    resizeYarnType(pile, yarnType, grams, month);
  });

  return pile;
}

function resizeYarnType(
  pile: YarnBall[],
  yarnType: string,
  grams: number,
  month: Temporal.PlainYearMonth,
) {
  const sizes = getBallSizes(grams);
  const inStash = pile
    .filter((ball) => ball.yarnType === yarnType && !ball.usedIn)
    .sort((a, b) => b.size - a.size);

  inStash.slice(sizes.length).forEach((ball) => {
    ball.usedIn = month;
  });

  const added = Array.from({ length: sizes.length - inStash.length }, () =>
    restockBall(pile, yarnType),
  );

  [...inStash, ...added].slice(0, sizes.length).forEach((ball, index) => {
    ball.size = sizes[index];
  });
}

function restockBall(pile: YarnBall[], yarnType: string): YarnBall {
  const mostRecentlyUsed = pile
    .filter((ball) => ball.usedIn)
    .sort((a, b) => Temporal.PlainYearMonth.compare(b.usedIn!, a.usedIn!))[0];

  if (mostRecentlyUsed) {
    mostRecentlyUsed.yarnType = yarnType;
    delete mostRecentlyUsed.usedIn;
    return mostRecentlyUsed;
  }

  const ball = { yarnType, size: 1 };
  pile.push(ball);
  return ball;
}
