import './YarnState.css';
import { useMemo } from 'react';
import { useYarnStorage } from './YarnStorageContext';
import { YarnPile } from './YarnPile';
import { YarnBallList } from './YarnBallList';
import { getPileBalls } from './pileBalls';
import { getThisMonth } from '../../../shared/dates';

export function YarnState() {
  const { pile, lastMonthPile, currentBalance } = useYarnStorage();
  const pileBalls = useMemo(() => pile && getPileBalls(pile), [pile]);
  const lastMonthBalls = useMemo(
    () =>
      lastMonthPile &&
      getPileBalls(lastMonthPile, getThisMonth().subtract({ months: 1 })),
    [lastMonthPile],
  );

  if (!pileBalls || !lastMonthBalls) {
    return <>Loading...</>;
  }

  return (
    <div className="yarn-state">
      <div className="label">Current: {currentBalance.toLocaleString()}g</div>
      <YarnPile balls={pileBalls} lastMonthBalls={lastMonthBalls} />
      <YarnBallList balls={pileBalls.map(({ ball }) => ball)} />
    </div>
  );
}
