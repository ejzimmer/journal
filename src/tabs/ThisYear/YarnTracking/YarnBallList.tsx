import { useId } from 'react';
import { YarnBall } from './types';
import { useYarnStorage } from './YarnStorageContext';
import { getBallDetails, getBallLabel } from './yarnBallText';

export function YarnBallList({
  balls,
  year,
}: {
  balls: YarnBall[];
  year: number;
}) {
  return (
    <ul className="yarn-ball-list">
      {balls.map((ball) => (
        <YarnBallListItem key={ball.id} ball={ball} year={year} />
      ))}
    </ul>
  );
}

function YarnBallListItem({ ball, year }: { ball: YarnBall; year: number }) {
  const { getBalance } = useYarnStorage(year);
  const detailsId = useId();

  return (
    <li aria-label={getBallLabel(ball)} aria-describedby={detailsId}>
      <span id={detailsId}>
        {getBallDetails(ball, getBalance(ball.yarnType))}
      </span>
    </li>
  );
}
