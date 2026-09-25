import { CSSProperties } from 'react';
import { YarnBall } from './types';
import { GRAMS_PER_BALL } from './utils';
import { useYarnStorage } from './YarnStorageContext';
import { BallOfYarnIcon } from '../../../shared/icons/BallOfYarn';
import { getBallDetails, getBallLabel } from './yarnBallText';

type YarnPileBallProps = {
  ball: YarnBall;
  fade?: number;
};

export function YarnPileBall({ ball, fade }: YarnPileBallProps) {
  const { getBalance } = useYarnStorage();
  const { yarnType, grams, usedIn } = ball;

  return (
    <div className="tooltip-container">
      <div
        className="ball tooltip-anchor"
        data-yarn-type={yarnType}
        data-used={usedIn ? true : undefined}
        role="img"
        aria-label={getBallLabel(ball)}
        style={
          {
            width: `calc(var(--ball-size) * ${grams / GRAMS_PER_BALL})`,
            '--fade': fade,
          } as CSSProperties
        }
      >
        <BallOfYarnIcon />
      </div>
      <div className="tooltip">
        {getBallDetails(ball, getBalance(yarnType))}
      </div>
    </div>
  );
}
