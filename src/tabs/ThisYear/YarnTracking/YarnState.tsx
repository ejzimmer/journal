import { CSSProperties } from 'react';

import './YarnState.css';
import { useYarnStorage } from './YarnStorageContext';
import { GRAMS_PER_BALL } from './utils';
import { MonthlyBalance } from './MonthlyBalance';

export function YarnState() {
  const { months } = useYarnStorage();

  if (!months) {
    return <>Loading...</>;
  }

  const maxTotal = Math.max(...months.map(({ total }) => total));

  return (
    <div className="yarn-state">
      <ol
        style={{ '--balls-across': maxTotal / GRAMS_PER_BALL } as CSSProperties}
      >
        {months.map((month, index) => (
          <li key={month.month.toString()}>
            <MonthLabel
              month={month.month}
              monthTotal={month.total}
              isLastMonth={index === months.length - 1}
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
