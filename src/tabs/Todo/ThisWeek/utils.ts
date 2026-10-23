import { getDaysSince } from '../../../shared/dates';
import { WeeklyTask } from '../../../shared/types';

const dateFormatter = Intl.DateTimeFormat('en-AU', {
  weekday: 'short',
  day: 'numeric',
});
const suffixes = ['th', 'st', 'nd', 'rd'];

export const dateToWeekday = (date: string) => {
  const formatted = dateFormatter.format(Temporal.PlainDate.from(date));
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

  return Temporal.PlainDate.compare(aLast, bLast);
};

const MAX_DAYS_BETWEEN_DONES = 5;

export const isTaskDue = (lastDone: string | undefined, frequency: number) => {
  if (!lastDone) return true;

  const daysBetweenDones = Math.min(
    Math.floor(7 / frequency),
    MAX_DAYS_BETWEEN_DONES,
  );
  return getDaysSince(lastDone) >= daysBetweenDones;
};
