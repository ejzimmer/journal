import { useId } from 'react';
import { YarnBall } from './types';
import { useYarnStorage } from './YarnStorageContext';
import { getBallDetails, getBallLabel } from './yarnBallText';

type YarnBallListItemProps = { ball: YarnBall };

export function YarnBallListItem({ ball }: YarnBallListItemProps) {
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
