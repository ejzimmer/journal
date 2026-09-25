import { CSSProperties } from 'react';

import './YarnState.css';
import { useYarn } from './useYarn';
import { GRAMS_PER_BALL, getHistoryByMonth } from './utils';
import { MonthlyBalance } from './MonthlyBalance';

export function YarnState() {
  const value = useYarn();

  if (!value) {
    return <>Loading...</>;
  }

  const monthEntries = Object.entries(getHistoryByMonth(value));
  const maxTotal = Math.max(...monthEntries.map(([, month]) => month.total));

  return (
    <div className="yarn-state">
      <ol
        style={{ '--balls-across': maxTotal / GRAMS_PER_BALL } as CSSProperties}
      >
        {monthEntries.map(([id, month], index) => (
          <li key={id}>
            <MonthLabel
              month={month.month}
              monthTotal={month.total}
              isLastMonth={index === monthEntries.length - 1}
            />
            <MonthlyBalance {...month} />
          </li>
        ))}
      </ol>
    </div>
  );
}

function MonthLabel({
  month,
  monthTotal,
  isLastMonth,
}: {
  month: Temporal.PlainYearMonth;
  monthTotal: number;
  isLastMonth: boolean;
}) {
  const monthName = month
    .toPlainDate({ day: 1 })
    .toLocaleString('default', { month: 'long' });

  return (
    <div className="label">
      {isLastMonth ? 'Current' : monthName}: {monthTotal.toLocaleString()}g
    </div>
  );
}
