import { useId } from 'react';
import { YarnBall } from './types';
import { useYarnStorage } from './YarnStorageContext';
import { getBallDetails, getBallLabel } from './yarnBallText';

export function YarnBallList({ balls }: { balls: YarnBall[] }) {
  return (
    <ul className="yarn-ball-list">
      {balls.map((ball) => (
        <YarnBallListItem key={ball.id} ball={ball} />
      ))}
    </ul>
  );
}

function YarnBallListItem({ ball }: { ball: YarnBall }) {
  const { getBalance } = useYarnStorage();
  const detailsId = useId();

  return (
    <li aria-label={getBallLabel(ball)} aria-describedby={detailsId}>
      <span id={detailsId}>
        {getBallDetails(ball, getBalance(ball.yarnType))}
      </span>
    </li>
  );
}
