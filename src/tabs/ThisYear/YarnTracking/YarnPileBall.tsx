import { CSSProperties, useId } from 'react';
import { YarnBall } from './types';
import { GRAMS_PER_BALL } from './utils';
import { useYarnStorage } from './YarnStorageContext';
import { BallOfYarnIcon } from '../../../shared/icons/BallOfYarn';
import { formatMonthAndYear, getThisMonth } from '../../../shared/dates';

const MONTHS_UNTIL_GONE = 12;

type YarnPileBallProps = {
  ball: YarnBall;
};

export function YarnPileBall({ ball }: YarnPileBallProps) {
  const { getBalance } = useYarnStorage();
  const tooltipId = useId();
  const { yarnType, grams, usedIn } = ball;
  const monthsSinceUsed =
    usedIn && getThisMonth().since(usedIn, { largestUnit: 'months' }).months;

  if (monthsSinceUsed !== undefined && monthsSinceUsed >= MONTHS_UNTIL_GONE) {
    return null;
  }

  const label = `${yarnType}: ${grams}g`;
  const details = usedIn
    ? `${yarnType}: ${grams}g, used ${formatMonthAndYear(usedIn)}`
    : `${yarnType}: ${getBalance(yarnType).toLocaleString()}g`;

  return (
    <div className="tooltip-container">
      <div
        className="ball tooltip-anchor"
        data-yarn-type={yarnType}
        data-used={usedIn ? true : undefined}
        role="img"
        aria-label={usedIn ? `used ${label}` : label}
        aria-describedby={tooltipId}
        style={
          {
            width: `calc(var(--ball-size) * ${grams / GRAMS_PER_BALL})`,
            '--fade':
              monthsSinceUsed === undefined
                ? undefined
                : monthsSinceUsed / MONTHS_UNTIL_GONE,
          } as CSSProperties
        }
      >
        <BallOfYarnIcon />
      </div>
      <div id={tooltipId} className="tooltip">
        {details}
      </div>
    </div>
  );
}
