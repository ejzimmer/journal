import { getPlainDate, StoredDate } from './shared/dates';
import { useStorageContext } from './shared/FirebaseContext';
import { useDailyJob } from './shared/dailyJobs/DailyJobsContext';
import {
  CALENDAR_KEY,
  CALENDAR_RESET_KEY,
  CalendarTask,
  DAILY_KEY,
  DAILY_RESET_KEY,
  DailyTask,
  TODO_KEY,
  WEEKLY_KEY,
  WEEKLY_RESET_KEY,
  WeeklyTask,
} from './shared/types';
import { WORK_CLEANUP_KEY, WORK_KEY, WorkTask } from './tabs/Work/types';

export const STORED_DATE_MIGRATION_KEY = `${TODO_KEY}/storedDateMigration`;

const RESET_KEYS = [
  DAILY_RESET_KEY,
  WEEKLY_RESET_KEY,
  CALENDAR_RESET_KEY,
  WORK_CLEANUP_KEY,
];

type WithLastUpdated<T> = T & { lastUpdated?: number };

const isEpoch = (date?: StoredDate | null): date is number =>
  typeof date === 'number';

const hasLastUpdated = (task: object) => 'lastUpdated' in task;

const withoutLastUpdated = <T extends object>(task: T): T => {
  const { lastUpdated: _lastUpdated, ...rest } = task as WithLastUpdated<T>;
  return rest as T;
};

const toDateString = (date: StoredDate) =>
  isEpoch(date) ? getPlainDate(date).toString() : date;

const migrateDailyTask = (task: DailyTask) =>
  isEpoch(task.lastCompleted) || hasLastUpdated(task)
    ? withoutLastUpdated({
        ...task,
        lastCompleted: toDateString(task.lastCompleted),
      })
    : undefined;

const migrateCalendarTask = (task: CalendarTask) =>
  isEpoch(task.dueDate) ||
  isEpoch(task.statusUpdateDate) ||
  hasLastUpdated(task)
    ? withoutLastUpdated({
        ...task,
        ...(task.dueDate !== undefined && {
          dueDate: toDateString(task.dueDate),
        }),
        ...(task.statusUpdateDate !== undefined && {
          statusUpdateDate: toDateString(task.statusUpdateDate),
        }),
      })
    : undefined;

const migrateWeeklyTask = (task: WeeklyTask) => {
  if (!task.completed) {
    return hasLastUpdated(task) ? withoutLastUpdated(task) : undefined;
  }

  if (Array.isArray(task.completed)) {
    if (!task.completed.some(isEpoch) && !hasLastUpdated(task)) {
      return undefined;
    }

    return withoutLastUpdated({
      ...task,
      completed: task.completed.map((date) => date && toDateString(date)),
    });
  }

  const completedById = task.completed as unknown as Record<
    string,
    StoredDate | null
  >;
  if (!Object.values(completedById).some(isEpoch) && !hasLastUpdated(task)) {
    return undefined;
  }

  return withoutLastUpdated({
    ...task,
    completed: Object.fromEntries(
      Object.entries(completedById).map(([id, date]) => [
        id,
        date && toDateString(date),
      ]),
    ) as unknown as WeeklyTask['completed'],
  });
};

const needsMigrating = (task: WorkTask): boolean =>
  isEpoch(task.lastStatusUpdate) ||
  isEpoch(task.dueDate) ||
  hasLastUpdated(task) ||
  Object.values(task.items ?? {}).some(needsMigrating);

const withDatesAsStrings = (task: WorkTask): WorkTask =>
  withoutLastUpdated({
    ...task,
    ...(task.lastStatusUpdate !== undefined && {
      lastStatusUpdate: toDateString(task.lastStatusUpdate),
    }),
    ...(task.dueDate !== undefined && { dueDate: toDateString(task.dueDate) }),
    ...(task.items && {
      items: Object.fromEntries(
        Object.entries(task.items).map(([id, item]) => [
          id,
          withDatesAsStrings(item),
        ]),
      ),
    }),
  });

const migrateWorkList = (list: WorkTask) =>
  needsMigrating(list) ? withDatesAsStrings(list) : undefined;

export function useStoredDateMigration() {
  const { useValue, updateItem, setValue } = useStorageContext();

  const daily = useValue<Record<string, DailyTask>>(DAILY_KEY);
  const weekly = useValue<Record<string, WeeklyTask>>(WEEKLY_KEY);
  const calendar = useValue<Record<string, CalendarTask>>(CALENDAR_KEY);
  const work = useValue<Record<string, WorkTask>>(WORK_KEY);
  const dailyReset = useValue<StoredDate>(DAILY_RESET_KEY);
  const weeklyReset = useValue<StoredDate>(WEEKLY_RESET_KEY);
  const calendarReset = useValue<StoredDate>(CALENDAR_RESET_KEY);
  const workCleanup = useValue<StoredDate>(WORK_CLEANUP_KEY);

  const resetValues = [dailyReset, weeklyReset, calendarReset, workCleanup];
  const sources = [daily, weekly, calendar, work, ...resetValues];

  useDailyJob({
    lastRunKey: STORED_DATE_MIGRATION_KEY,
    isReady: sources.every(({ loading }) => !loading),
    run: () => {
      const migrateInto = <T extends { id: string }>(
        key: string,
        tasksById: Record<string, T> | undefined,
        migrate: (task: T) => T | undefined,
      ) =>
        Object.values(tasksById ?? {}).forEach((task) => {
          const migrated = migrate(task);
          if (migrated) updateItem(key, migrated);
        });

      migrateInto(DAILY_KEY, daily.value, migrateDailyTask);
      migrateInto(WEEKLY_KEY, weekly.value, migrateWeeklyTask);
      migrateInto(CALENDAR_KEY, calendar.value, migrateCalendarTask);
      migrateInto(WORK_KEY, work.value, migrateWorkList);

      RESET_KEYS.forEach((key, index) => {
        const { value } = resetValues[index];
        if (isEpoch(value)) setValue(key, toDateString(value));
      });
    },
  });
}
