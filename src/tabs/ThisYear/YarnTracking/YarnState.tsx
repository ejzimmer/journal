import './YarnState.css';
import { useYarnStorage } from './YarnStorageContext';
import { YarnPileBall } from './YarnPileBall';
import { YarnBallList } from './YarnBallList';
import { YarnBall } from './types';
import { getThisMonth } from '../../../shared/dates';

const MONTHS_UNTIL_GONE = 12;

const getFade = ({ usedIn }: YarnBall) =>
  usedIn &&
  getThisMonth().since(usedIn, { largestUnit: 'months' }).months /
    MONTHS_UNTIL_GONE;

export function YarnState() {
  const { pile, currentBalance } = useYarnStorage();

  if (!pile) {
    return <>Loading...</>;
  }

  const balls = pile
    .map((ball) => ({ ball, fade: getFade(ball) }))
    .filter(({ fade }) => fade === undefined || fade < 1);

  return (
    <div className="yarn-state">
      <div className="label">Current: {currentBalance.toLocaleString()}g</div>
      <div className="yarn-pile" aria-hidden="true">
        {balls.map(({ ball, fade }) => (
          <YarnPileBall key={ball.id} ball={ball} fade={fade} />
        ))}
      </div>
      <YarnBallList balls={balls.map(({ ball }) => ball)} />
    </div>
  );
}
