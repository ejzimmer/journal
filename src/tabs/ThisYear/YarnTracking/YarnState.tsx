import { CSSProperties } from 'react';
import { YarnBall } from './types';

import './YarnState.css';
import { useYarnStorage } from './YarnStorageContext';
import { GRAMS_PER_BALL, getThisMonth } from './utils';
import { BallOfYarnIcon } from '../../../shared/icons/BallOfYarn';

const MONTHS_UNTIL_GONE = 12;

export function YarnState() {
  const { pile, currentBalance } = useYarnStorage();

  if (!pile) {
    return <>Loading...</>;
  }

  const thisMonth = getThisMonth();

  return (
    <div className="yarn-state">
      <div className="label">Current: {currentBalance.toLocaleString()}g</div>
      <div className="yarn-pile">
        {pile.map((ball, index) => (
          <Ball key={index} ball={ball} thisMonth={thisMonth} />
        ))}
      </div>
    </div>
  );
}

function Ball({
  ball,
  thisMonth,
}: {
  ball: YarnBall;
  thisMonth: Temporal.PlainYearMonth;
}) {
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
