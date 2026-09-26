import {
  createDailyJobsStorage,
  renderDailyJob,
} from './shared/dailyJobs/dailyJobsTestUtils';
import { getDateDaysAgo } from './shared/dates';
import { getLegacyTimestampDaysAgo } from './shared/dateTestUtils';
import {
  CALENDAR_KEY,
  CALENDAR_RESET_KEY,
  CalendarTask,
  DAILY_KEY,
  DAILY_RESET_KEY,
  DailyTask,
  WEEKLY_KEY,
  WEEKLY_RESET_KEY,
  WeeklyTask,
} from './shared/types';
import { WORK_CLEANUP_KEY, WORK_KEY, WorkTask } from './tabs/Work/types';
import { useStoredDateMigration } from './useStoredDateMigration';

const indexById = <T extends { id: string }>(items: T[]) =>
  Object.fromEntries(items.map((item) => [item.id, item]));

const hasUndefinedValue = (value: unknown): boolean =>
  typeof value === 'object' && value !== null
    ? Object.values(value).some(
        (child) => child === undefined || hasUndefinedValue(child),
      )
    : false;

const migrate = (storedValues: Record<string, unknown>) => {
  const storage = createDailyJobsStorage(storedValues);
  renderDailyJob(useStoredDateMigration, storage);

  return storage;
};

const createDailyTask = (lastCompleted: DailyTask['lastCompleted']) =>
  ({
    id: 'stretch',
    description: 'Stretch',
    category: '🧘',
    position: 0,
    type: '毎日',
    status: 'ready',
    lastCompleted,
  }) as DailyTask;

const createCalendarTask = (
  dueDate: CalendarTask['dueDate'],
  statusUpdateDate: CalendarTask['statusUpdateDate'],
) =>
  ({
    id: 'passport',
    description: 'Renew passport',
    category: '✈️',
    position: 0,
    status: 'ready',
    dueDate,
    statusUpdateDate,
  }) as CalendarTask;

const createWeeklyTask = (completed: WeeklyTask['completed']) =>
  ({
    id: 'training',
    description: 'Strength training',
    category: '🏃‍♀️',
    position: 0,
    frequency: 3,
    completed,
  }) as WeeklyTask;

const createWorkTask = (
  id: string,
  overrides: Partial<WorkTask> = {},
): WorkTask => ({
  id,
  description: id,
  status: 'not_started',
  parentId: WORK_KEY,
  position: 0,
  lastStatusUpdate: getDateDaysAgo(1),
  ...overrides,
});

describe('migrating stored dates', () => {
  describe('a daily task completed before the migration', () => {
    it('rewrites lastCompleted as a date string', () => {
      const storage = migrate({
        [DAILY_KEY]: indexById([createDailyTask(getLegacyTimestampDaysAgo(2))]),
      });

      expect(storage.updateItem).toHaveBeenCalledWith(
        DAILY_KEY,
        expect.objectContaining({ lastCompleted: getDateDaysAgo(2) }),
      );
    });
  });

  describe('a calendar task', () => {
    it('rewrites both of its dates', () => {
      const storage = migrate({
        [CALENDAR_KEY]: indexById([
          createCalendarTask(
            getLegacyTimestampDaysAgo(-3),
            getLegacyTimestampDaysAgo(1),
          ),
        ]),
      });

      expect(storage.updateItem).toHaveBeenCalledWith(
        CALENDAR_KEY,
        expect.objectContaining({
          dueDate: getDateDaysAgo(-3),
          statusUpdateDate: getDateDaysAgo(1),
        }),
      );
    });

    describe('when only one of its dates is still an epoch', () => {
      it('rewrites that one and leaves the other', () => {
        const storage = migrate({
          [CALENDAR_KEY]: indexById([
            createCalendarTask(
              getDateDaysAgo(-3),
              getLegacyTimestampDaysAgo(1),
            ),
          ]),
        });

        expect(storage.updateItem).toHaveBeenCalledWith(
          CALENDAR_KEY,
          expect.objectContaining({
            dueDate: getDateDaysAgo(-3),
            statusUpdateDate: getDateDaysAgo(1),
          }),
        );
      });
    });
  });

  describe("a weekly task's completed dates", () => {
    describe('when stored as an array', () => {
      it('rewrites each entry and keeps it an array', () => {
        const storage = migrate({
          [WEEKLY_KEY]: indexById([
            createWeeklyTask([
              getLegacyTimestampDaysAgo(4),
              getLegacyTimestampDaysAgo(2),
            ]),
          ]),
        });

        expect(storage.updateItem).toHaveBeenCalledWith(
          WEEKLY_KEY,
          expect.objectContaining({
            completed: [getDateDaysAgo(4), getDateDaysAgo(2)],
          }),
        );
      });
    });

    describe('when Firebase has stored it as an object', () => {
      it('rewrites each entry and keeps it an object', () => {
        const storage = migrate({
          [WEEKLY_KEY]: indexById([
            createWeeklyTask({
              '1': getLegacyTimestampDaysAgo(4),
              '3': getLegacyTimestampDaysAgo(2),
            } as unknown as WeeklyTask['completed']),
          ]),
        });

        expect(storage.updateItem).toHaveBeenCalledWith(
          WEEKLY_KEY,
          expect.objectContaining({
            completed: { '1': getDateDaysAgo(4), '3': getDateDaysAgo(2) },
          }),
        );
      });
    });
  });

  describe('a work task nested inside a list', () => {
    it('is rewritten along with the list that holds it', () => {
      const task = createWorkTask('fix-the-thing', {
        parentId: `${WORK_KEY}/today/items`,
        lastStatusUpdate: getLegacyTimestampDaysAgo(2),
        dueDate: getLegacyTimestampDaysAgo(-1),
      });
      const list = createWorkTask('today', {
        lastStatusUpdate: getLegacyTimestampDaysAgo(5),
        items: indexById([task]),
      });
      const storage = migrate({ [WORK_KEY]: indexById([list]) });

      expect(storage.updateItem).toHaveBeenCalledWith(WORK_KEY, {
        ...list,
        lastStatusUpdate: getDateDaysAgo(5),
        items: indexById([
          {
            ...task,
            lastStatusUpdate: getDateDaysAgo(2),
            dueDate: getDateDaysAgo(-1),
          },
        ]),
      });
    });

    describe('when a list or task has never had a status update', () => {
      it('leaves the field off rather than writing undefined', () => {
        const withoutStatusUpdate = {
          id: 'never-updated',
          description: 'never-updated',
          parentId: `${WORK_KEY}/today/items`,
          position: 0,
        } as unknown as WorkTask;
        const list = {
          id: 'today',
          description: 'Today',
          parentId: WORK_KEY,
          position: 0,
          items: indexById([
            withoutStatusUpdate,
            createWorkTask('dated', {
              lastStatusUpdate: getLegacyTimestampDaysAgo(2),
            }),
          ]),
        } as unknown as WorkTask;
        const storage = migrate({ [WORK_KEY]: indexById([list]) });

        const [, migrated] = (storage.updateItem as jest.Mock).mock.calls[0];
        expect(hasUndefinedValue(migrated)).toBe(false);
        expect(migrated.items['never-updated']).not.toHaveProperty(
          'lastStatusUpdate',
        );
        expect(migrated.items.dated.lastStatusUpdate).toBe(getDateDaysAgo(2));
      });
    });

    describe('when the task has no due date', () => {
      it("doesn't invent one", () => {
        const task = createWorkTask('no-due-date', {
          parentId: `${WORK_KEY}/today/items`,
          lastStatusUpdate: getLegacyTimestampDaysAgo(2),
        });
        const list = createWorkTask('today', { items: indexById([task]) });
        const storage = migrate({ [WORK_KEY]: indexById([list]) });

        const [, migrated] = (storage.updateItem as jest.Mock).mock.calls[0];
        expect(migrated.items['no-due-date']).not.toHaveProperty('dueDate');
      });
    });
  });

  describe('the keys recording when each daily job last ran', () => {
    it('rewrites each one that is still an epoch', () => {
      const storage = migrate({
        [DAILY_RESET_KEY]: getLegacyTimestampDaysAgo(1),
        [WEEKLY_RESET_KEY]: getDateDaysAgo(1),
        [CALENDAR_RESET_KEY]: getLegacyTimestampDaysAgo(3),
        [WORK_CLEANUP_KEY]: getLegacyTimestampDaysAgo(2),
      });

      expect(storage.setValue).toHaveBeenCalledWith(
        DAILY_RESET_KEY,
        getDateDaysAgo(1),
      );
      expect(storage.setValue).toHaveBeenCalledWith(
        CALENDAR_RESET_KEY,
        getDateDaysAgo(3),
      );
      expect(storage.setValue).toHaveBeenCalledWith(
        WORK_CLEANUP_KEY,
        getDateDaysAgo(2),
      );
      expect(storage.setValue).not.toHaveBeenCalledWith(
        WEEKLY_RESET_KEY,
        expect.anything(),
      );
    });
  });

  describe('when everything is already a date string', () => {
    it('writes nothing', () => {
      const storage = migrate({
        [DAILY_KEY]: indexById([createDailyTask(getDateDaysAgo(2))]),
        [CALENDAR_KEY]: indexById([
          createCalendarTask(getDateDaysAgo(-3), getDateDaysAgo(1)),
        ]),
        [WEEKLY_KEY]: indexById([createWeeklyTask([getDateDaysAgo(4)])]),
        [WORK_KEY]: indexById([createWorkTask('today')]),
      });

      expect(storage.updateItem).not.toHaveBeenCalled();
    });
  });
});
