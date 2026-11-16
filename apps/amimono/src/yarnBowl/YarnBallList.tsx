import { YarnBall } from './types';
import { YarnBallListItem } from './YarnBallListItem';

type YarnBallListProps = { balls: YarnBall[] };

export function YarnBallList({ balls }: YarnBallListProps) {
  return (
    <ul className="yarn-ball-list">
      {balls.map((ball) => (
        <YarnBallListItem key={ball.id} ball={ball} />
      ))}
    </ul>
  );
}
