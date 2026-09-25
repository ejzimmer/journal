import './YarnState.css';
import { useMemo } from 'react';
import { useYarnStorage } from './YarnStorageContext';
import { YarnPile } from './YarnPile';
import { YarnBallList } from './YarnBallList';
import { getPileBalls } from './pileBalls';

export function YarnState() {
  const { pile, currentBalance } = useYarnStorage();
  const pileBalls = useMemo(() => pile && getPileBalls(pile), [pile]);

  if (!pileBalls) {
    return <>Loading...</>;
  }

  return (
    <div className="yarn-state">
      <div className="label">Current: {currentBalance.toLocaleString()}g</div>
      <YarnPile balls={pileBalls} />
      <YarnBallList balls={pileBalls.map(({ ball }) => ball)} />
    </div>
  );
}
