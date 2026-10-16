import { CSSProperties, useLayoutEffect, useMemo, useRef } from 'react';

import './WeeklyCalorieTracker.css';
import {
  Balance,
  STARTING_BALANCE,
  getWeekClass,
  getWeekLowestShare,
  getWeeklyBalance,
} from '../utils';

type WeeklyCalorieTrackerProps = {
  days: Balance[];
};

export function WeeklyCalorieTracker({ days }: WeeklyCalorieTrackerProps) {
  const weeklyBalances = useMemo(() => getWeeklyBalance(days), [days]);
  const chartRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const chart = chartRef.current;
    if (chart) {
      chart.scrollLeft = chart.scrollWidth;
    }
  }, [weeklyBalances.length]);

  const weekBalances = weeklyBalances.map((balance) => balance.balance);
  const highestBalance = Math.max(...weekBalances);
  const lowestBalance = Math.min(...weekBalances);
  const heightScale = Math.max(highestBalance, STARTING_BALANCE);

  return (
    <div ref={chartRef} className="weekly-calories">
      {weeklyBalances.map((balance, index) => (
        <div className="week-container" key={index}>
          <div
            className={getWeekClass({
              balance: balance.balance,
              lowestBalance,
            })}
            style={
              {
                height: (balance.balance / heightScale) * 100 + '%',
                '--lowest-share': `${getWeekLowestShare({ balance: balance.balance, lowestBalance }) * 100}%`,
              } as CSSProperties
            }
            role="img"
            aria-label={`${balance.day} ${balance.month}: ${balance.balance.toLocaleString()}`}
          />
          <div className="hovertext">
            {balance.day} {balance.month}: {balance.balance.toLocaleString()}
          </div>
        </div>
      ))}
    </div>
  );
}
