import './YarnState.css';
import { useMemo } from 'react';
import { useYarnStorage } from './YarnStorageContext';
import { YarnPile } from './YarnPile';
import { YarnBallList } from './YarnBallList';
import { getLatestMonthOfYear, getPileBalls } from './pileBalls';

export function YarnState() {
  const { year, pile, pileHistory, currentBalance } = useYarnStorage();
  const pileBalls = useMemo(
    () => pile && getPileBalls(pile, getLatestMonthOfYear(year)),
    [pile, year],
  );
  const replayBalls = useMemo(
    () =>
      pileHistory?.map(({ month, pile }) => getPileBalls(pile, month)) ?? [],
    [pileHistory],
  );

  if (!pileBalls) {
    return <>Loading...</>;
  }

  return (
    <div className="yarn-state">
      <div className="label">Current: {currentBalance.toLocaleString()}g</div>
      <YarnPile balls={pileBalls} replayBalls={replayBalls} />
      <YarnBallList balls={pileBalls.map(({ ball }) => ball)} />
    </div>
  );
}
