import { getDateDaysAhead, getToday } from 'shared/dates';
import {
  createDailyJobsStorage,
  renderDailyJob,
} from 'shared/dailyJobs/dailyJobsTestUtils';
import {
  CALENDAR_KEY,
  CalendarTask,
  DAILY_KEY,
  DailyTask,
  TODAY_SNAPSHOT_KEY,
} from '../../types';
import { useTodaySnapshot } from './useTodaySnapshot';

const vitamins: DailyTask = {
  id: 'vitamins',
  description: 'Take vitamins',
  category: '💊',
  parentId: DAILY_KEY,
  position: 0,
  type: '毎日',
  status: 'ready',
  lastCompleted: getToday(),
};

const createCalendarTask = (
  id: string,
  status: CalendarTask['status'],
): CalendarTask => ({
  id,
  description: id,
  category: '🧾',
  parentId: CALENDAR_KEY,
  position: 0,
  dueDate: getDateDaysAhead(5),
  status,
  statusUpdateDate: getToday(),
});

describe('keeping the Today tab snapshot', () => {
  describe('at the start of the day', () => {
    it("replaces yesterday's snapshot with the tasks for today", async () => {
      const storage = createDailyJobsStorage({
        [DAILY_KEY]: { vitamins },
        [TODAY_SNAPSHOT_KEY]: {
          'old-task': { id: 'old-task', listId: CALENDAR_KEY },
        },
      });

      await renderDailyJob(useTodaySnapshot, storage);

      expect(storage.setValue).toHaveBeenCalledWith(TODAY_SNAPSHOT_KEY, {
        vitamins: { id: 'vitamins', listId: DAILY_KEY },
      });
    });
  });

  describe('later in the day', () => {
    describe('when a task becomes ready on the Todo tab', () => {
      it('adds it to the snapshot', async () => {
        const storedValues: Record<string, unknown> = {
          [DAILY_KEY]: { vitamins },
          [CALENDAR_KEY]: { dentist: createCalendarTask('dentist', 'paused') },
          [TODAY_SNAPSHOT_KEY]: {
            vitamins: { id: 'vitamins', listId: DAILY_KEY },
          },
        };
        const storage = createDailyJobsStorage(storedValues);
        const { rerender } = await renderDailyJob(useTodaySnapshot, storage);

        storedValues[CALENDAR_KEY] = {
          dentist: createCalendarTask('dentist', 'ready'),
        };
        await rerender();

        expect(storage.setValues).toHaveBeenCalledWith({
          [`${TODAY_SNAPSHOT_KEY}/dentist`]: {
            id: 'dentist',
            listId: CALENDAR_KEY,
          },
        });
      });
    });
  });
});
