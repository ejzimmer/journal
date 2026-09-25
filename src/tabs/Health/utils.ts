import { formatDate, formatDateId, getDaysSince } from '../../shared/dates';
import { DayData } from '../../shared/types';

export const STARTING_BALANCE = 19687;

export type Balance = {
  id: string;
  day: number;
  month: string;
  monthNumber: number;
  dayOfWeek: number;
  balance?: number;
  diff?: number;
  trackers?: string[];
};

export function setupDays(dayData?: Record<string, DayData>): Balance[] {
  const newYearsDay = Temporal.PlainDate.from('2026-01-01');
  const numberOfDays = getDaysSince(newYearsDay.toString()) - 1;
  const days = new Array<Balance>(numberOfDays);

  let balance = STARTING_BALANCE;
  for (let i = 0; i <= numberOfDays; i += 1) {
    const date = newYearsDay.add({ days: i });
    const { day, month } = formatDate(date);
    const id = formatDateId(date);
    const { consumed, expended, trackers } = dayData?.[id] ?? {};
    const diff =
      typeof consumed === 'number' && typeof expended === 'number'
        ? expended - consumed
        : undefined;
    balance -= diff ?? 0;

    days[i] = {
      id,
      day,
      month,
      monthNumber: date.month,
      dayOfWeek: date.dayOfWeek,
      diff,
      trackers,
      balance,
    };
  }

  return days;
}

export const getWeeklyBalance = (balances: Balance[]): Required<Balance>[] => {
  const weeklyBalances = balances.filter(
    (b, index) => index % 7 === 6 && b.balance,
  ) as Required<Balance>[];

  const lastCompleteIndex = balances.findLastIndex(
    (b) => typeof b.balance === 'number',
  );
  const lastComplete = balances[lastCompleteIndex] as
    Required<Balance> | undefined;

  return lastComplete && lastCompleteIndex % 7 !== 6
    ? [...weeklyBalances, lastComplete]
    : weeklyBalances;
};

export const getWeekClass = ({
  balance,
  highestBalance,
  lowestBalance,
}: {
  balance: Required<Balance>;
  highestBalance: number;
  lowestBalance: number;
}) => {
  const className = 'week hovertext-anchor';
  if (balance.balance === highestBalance) {
    return `${className} week-highest`;
  }
  if (balance.balance === lowestBalance) {
    return `${className} week-lowest`;
  }
  return className;
};
