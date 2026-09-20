import { KEY, Yarn } from './types';

import './YarnState.css';
import { useStorageContext } from '../../../shared/FirebaseContext';
import { GRAMS_PER_BALL, getHistoryByMonth } from './utils';
import { MonthlyBalance } from './MonthlyBalance';

const MAX_BALL_WIDTH = 44;

export function YarnState() {
  const { useValue } = useStorageContext();

  const { value } = useValue<Yarn>(KEY);

  if (!value) {
    return <>Loading...</>;
  }

  const monthEntries = Object.entries(getHistoryByMonth(value));
  const maxTotal = Math.max(...monthEntries.map(([, month]) => month.total));

  return (
    <div className="yarn-state">
      <ol
        style={{
          maxWidth: `${(maxTotal / GRAMS_PER_BALL) * MAX_BALL_WIDTH}px`,
        }}
      >
        {monthEntries.map(([id, month], index) => (
          <li key={id} style={{ width: `${(month.total / maxTotal) * 100}%` }}>
            <MonthLabel
              monthNumber={id.split('-')[1]}
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
  monthNumber,
  monthTotal,
  isLastMonth,
}: {
  monthNumber: string;
  monthTotal: number;
  isLastMonth: boolean;
}) {
  const monthName = new Date(`2000-${monthNumber}-01`).toLocaleString(
    'default',
    {
      month: 'long',
    },
  );

  return (
    <div className="label">
      {isLastMonth ? 'Current' : monthName}: {monthTotal.toLocaleString()}g
    </div>
  );
}
