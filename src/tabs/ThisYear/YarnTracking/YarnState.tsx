import './YarnState.css';
import { useYarnStorage } from './YarnStorageContext';
import { getThisMonth } from './utils';
import { YarnPileBall } from './YarnPileBall';

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
          <YarnPileBall key={index} ball={ball} thisMonth={thisMonth} />
        ))}
      </div>
    </div>
  );
}
