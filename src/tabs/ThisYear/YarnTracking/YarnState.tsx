import './YarnState.css';
import { useMemo } from 'react';
import { useYarnStorage } from './YarnStorageContext';
import { YarnPile } from './YarnPile';
import { YarnBallList } from './YarnBallList';
import { getLatestMonthOfYear, getPileBalls } from './pileBalls';

export function YarnState({ year }: { year: number }) {
  const { pile } = useYarnStorage(year);
  const pileBalls = useMemo(
    () => pile && getPileBalls(pile, getLatestMonthOfYear(year)),
    [pile, year],
  );

  if (!pileBalls) {
    return <>Loading...</>;
  }

  return (
    <div className="yarn-state">
      <YarnPile balls={pileBalls} year={year} />
      <YarnBallList balls={pileBalls.map(({ ball }) => ball)} year={year} />
    </div>
  );
}
