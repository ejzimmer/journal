import { useState } from 'react';
import { getThisYear, getToday } from './dates';

export const FIRST_TRACKED_YEAR = 2026;

export type Completable = { completedAt?: string };

export const getCompletionYear = ({ completedAt }: Completable) =>
  completedAt ? Temporal.PlainDate.from(completedAt).year : FIRST_TRACKED_YEAR;

export function stampCompletion<T extends Completable>(
  item: T,
  isComplete: boolean,
): T {
  const { completedAt, ...incompleteItem } = item;
  return isComplete
    ? { ...item, completedAt: completedAt ?? getToday() }
    : (incompleteItem as T);
}

export const listYearsNewestFirst = (thisYear: number, years: number[]) =>
  [...new Set([thisYear, ...years])].sort((a, b) => b - a);

export function useCompletionYears<T extends Completable>(
  items: T[],
  isComplete: (item: T) => boolean,
) {
  const thisYear = getThisYear();
  const [selectedYear, selectYear] = useState(thisYear);
  const years = listYearsNewestFirst(
    thisYear,
    items.filter(isComplete).map(getCompletionYear),
  );

  const isInSelectedYear = (item: T) =>
    isComplete(item)
      ? getCompletionYear(item) === selectedYear
      : selectedYear === thisYear;

  return {
    years,
    selectedYear,
    selectYear,
    isThisYearSelected: selectedYear === thisYear,
    isInSelectedYear,
  };
}
