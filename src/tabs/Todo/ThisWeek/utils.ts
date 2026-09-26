import { compareDates, getPlainDate, StoredDate } from '../../../shared/dates';
import { WeeklyTask } from '../../../shared/types';

const dateFormatter = Intl.DateTimeFormat('en-AU', {
  weekday: 'short',
  day: 'numeric',
});
const suffixes = ['th', 'st', 'nd', 'rd'];

export const dateToWeekday = (date: StoredDate) => {
  const formatted = dateFormatter.format(getPlainDate(date));
  const secondLastDigit = formatted.at(-2);
  const lastDigit = formatted.at(-1);
  const suffixIndex = lastDigit ? Number.parseInt(lastDigit) : -1;

  if (secondLastDigit === '1') {
    return `${formatted}th`;
  }

  return `${formatted}${suffixes[suffixIndex] ?? 'th'}`;
};

export const compareLastCompleted = (a: WeeklyTask, b: WeeklyTask) => {
  const aLast = a.completed?.at(-1);
  const bLast = b.completed?.at(-1);

  if (!aLast) return bLast ? -1 : 0;
  if (!bLast) return 1;

  return compareDates(aLast, bLast);
};
