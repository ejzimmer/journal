import { formatWeekdayDayAndMonth, getDaysUntil } from '../../../shared/dates';

const findUrgencyClass = (date: string) => {
  const daysUntil = getDaysUntil(date);

  if (daysUntil <= 7) {
    return 'very-soon';
  }
  if (daysUntil <= 21) {
    return 'soon';
  }
  return '';
};

export function PlannedDate({
  date,
  isDone,
}: {
  date: string;
  isDone: boolean;
}) {
  return (
    <span className={`planned-date ${isDone ? '' : findUrgencyClass(date)}`}>
      {formatWeekdayDayAndMonth(date)}
    </span>
  );
}
