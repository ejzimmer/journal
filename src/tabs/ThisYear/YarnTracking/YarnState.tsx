import './YarnState.css';
import { useYarnStorage } from './YarnStorageContext';
import { YarnPileBall } from './YarnPileBall';

export function YarnState() {
  const { pile, currentBalance } = useYarnStorage();

  if (!pile) {
    return <>Loading...</>;
  }

  return (
    <div className="yarn-state">
      <div className="label">Current: {currentBalance.toLocaleString()}g</div>
      <div className="yarn-pile">
        {pile.map((ball) => (
          <YarnPileBall key={ball.id} ball={ball} />
        ))}
      </div>
    </div>
  );
}
