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

const getBalanceChangesByMonth = (yarnTypes: YarnType[]) => {
  const changes = yarnTypes.flatMap(({ id, balances }) =>
    balances.map(({ month, grams }, index) => ({
      yarnType: id,
      month,
      grams,
      difference: grams - (balances[index - 1]?.grams ?? 0),
    })),
  );

  const changesByMonth = Map.groupBy(
    changes.sort((a, b) => Temporal.PlainYearMonth.compare(a.month, b.month)),
    ({ month }) => month.toString(),
  );

  return [...changesByMonth.values()].map((changesThisMonth) => ({
    decreases: changesThisMonth.filter(({ difference }) => difference < 0),
    increases: changesThisMonth.filter(({ difference }) => difference > 0),
  }));
};

type YarnPile = { balls: YarnBall[]; usedBallIndexes: number[] };

export function buildYarnPile(yarnTypes: YarnType[]): YarnBall[] {
  const { balls } = getBalanceChangesByMonth(yarnTypes).reduce<YarnPile>(
    (pile, { decreases, increases }) =>
      increases.reduce(addYarn, decreases.reduce(useYarn, pile)),
    { balls: [], usedBallIndexes: [] },
  );

  return balls;
}

const getStashIndexes = (balls: YarnBall[], yarnType: string) =>
  balls
    .map((ball, index) => ({ ball, index }))
    .filter(({ ball }) => ball.yarnType === yarnType && !ball.usedIn)
    .sort((a, b) => b.ball.size - a.ball.size)
    .map(({ index }) => index);

function useYarn(
  { balls, usedBallIndexes }: YarnPile,
  { yarnType, grams, month }: YarnTypeBalance,
): YarnPile {
  const sizes = getBallSizes(grams);
  const stashIndexes = getStashIndexes(balls, yarnType);
  const usedUpIndexes = stashIndexes.slice(sizes.length);

  const updatedBalls = [...balls];
  stashIndexes.slice(0, sizes.length).forEach((ballIndex, sizeIndex) => {
    updatedBalls[ballIndex] = { yarnType, size: sizes[sizeIndex] };
  });
  usedUpIndexes.forEach((ballIndex) => {
    updatedBalls[ballIndex] = { ...balls[ballIndex], usedIn: month };
  });

  return {
    balls: updatedBalls,
    usedBallIndexes: [...usedBallIndexes, ...usedUpIndexes],
  };
}

function addYarn(
  { balls, usedBallIndexes }: YarnPile,
  { yarnType, grams }: YarnTypeBalance,
): YarnPile {
  const sizes = getBallSizes(grams);
  const stashIndexes = getStashIndexes(balls, yarnType);

  const restockCount = Math.min(
    sizes.length - stashIndexes.length,
    usedBallIndexes.length,
  );
  const stillUsedIndexes = usedBallIndexes.slice(
    0,
    usedBallIndexes.length - restockCount,
  );
  const restockIndexes = usedBallIndexes
    .slice(stillUsedIndexes.length)
    .reverse();
  const newBallIndexes = Array.from(
    { length: sizes.length - stashIndexes.length - restockCount },
    (_, index) => balls.length + index,
  );

  const updatedBalls = [...balls];
  [...stashIndexes, ...restockIndexes, ...newBallIndexes].forEach(
    (ballIndex, sizeIndex) => {
      updatedBalls[ballIndex] = { yarnType, size: sizes[sizeIndex] };
    },
  );

  return { balls: updatedBalls, usedBallIndexes: stillUsedIndexes };
}
