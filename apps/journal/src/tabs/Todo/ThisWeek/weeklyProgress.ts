import { getDaysSince } from 'shared/dates';
import { getMostRecentlyDone, isTaskDue } from './utils';

export type WeeklyProgress = {
  numberDone: number;
  frequency: number;
  label: string;
  isDue: boolean;
  fillOpacity: number;
  onAdd: () => void;
  onRemove: () => void;
};

export function getWeeklyProgress(completed: string[], frequency: number) {
  const numberDone = completed.length;
  const mostRecentlyDone = getMostRecentlyDone(completed);
  const daysSinceDone = mostRecentlyDone ? getDaysSince(mostRecentlyDone) : 0;

  return {
    numberDone,
    remainder: Math.max(numberDone - frequency, 0),
    isDue: isTaskDue(mostRecentlyDone, frequency),
    fillOpacity:
      daysSinceDone > 2 ? Math.max(0, 1 - 0.2 * (daysSinceDone - 2)) : 1,
  };
}
