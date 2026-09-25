import { CSSProperties } from 'react';
import { YarnBall } from './types';
import { GRAMS_PER_BALL } from './utils';
import { BallOfYarnIcon } from '../../../shared/icons/BallOfYarn';

const MONTHS_UNTIL_GONE = 12;

type YarnPileBallProps = {
  ball: YarnBall;
  thisMonth: Temporal.PlainYearMonth;
};

export function YarnPileBall({ ball, thisMonth }: YarnPileBallProps) {
  const { yarnType, size, usedIn } = ball;
  const monthsSinceUsed =
    usedIn && thisMonth.since(usedIn, { largestUnit: 'months' }).months;

  if (monthsSinceUsed !== undefined && monthsSinceUsed >= MONTHS_UNTIL_GONE) {
    return null;
  }

  const grams = `${Math.round(size * GRAMS_PER_BALL)}g`;

  return (
    <div
      className="ball"
      data-yarn-type={yarnType}
      data-used={usedIn ? true : undefined}
      role="img"
      aria-label={
        usedIn ? `used ${yarnType}: ${grams}` : `${yarnType}: ${grams}`
      }
      style={
        {
          width: `calc(var(--ball-size) * ${size})`,
          '--fade':
            monthsSinceUsed === undefined
              ? undefined
              : monthsSinceUsed / MONTHS_UNTIL_GONE,
        } as CSSProperties
      }
    >
      <BallOfYarnIcon />
    </div>
  );
}
