import { isAfterToday } from 'shared/dates';
import {
  CALENDAR_KEY,
  CalendarTask,
  DAILY_KEY,
  DailyTask,
  SnapshotEntry,
  WEEKLY_KEY,
  WeeklyTask,
} from '../../types';
import { isWeeklyTaskDue } from '../Todo/ThisWeek/utils';

export type TodoLists = {
  daily?: Record<string, DailyTask>;
  weekly?: Record<string, WeeklyTask>;
  calendar?: Record<string, CalendarTask>;
};

export const isCalendarTaskForToday = (task: CalendarTask) =>
  task.status !== 'finished' &&
  (task.status === 'ready' || !isAfterToday(task.dueDate));

const createEntries = (listId: string, tasks: { id: string }[]) =>
  tasks.map(({ id }) => ({ id, listId }));

export function findEntriesForToday({
  daily = {},
  weekly = {},
  calendar = {},
}: TodoLists): SnapshotEntry[] {
  return [
    ...createEntries(
      DAILY_KEY,
      Object.values(daily).filter((task) => task.type === '毎日'),
    ),
    ...createEntries(WEEKLY_KEY, Object.values(weekly).filter(isWeeklyTaskDue)),
    ...createEntries(
      CALENDAR_KEY,
      Object.values(calendar).filter(isCalendarTaskForToday),
    ),
  ];
}

export const indexEntriesById = (entries: SnapshotEntry[]) =>
  Object.fromEntries(entries.map((entry) => [entry.id, entry]));
