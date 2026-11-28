import { formatDayAndMonth } from 'shared/dates';
import { getDueDateClass } from '../../Todo/DueDate/getDueDateClass';

import './DueDateChip.css';

type DueDateChipProps = { dueDate: string; isFinished: boolean };

export function DueDateChip({ dueDate, isFinished }: DueDateChipProps) {
  const urgencyClass = isFinished ? 'finished' : getDueDateClass(dueDate);

  return (
    <span className={`due-date-chip ${urgencyClass}`}>
      {formatDayAndMonth(dueDate)}
    </span>
  );
}
