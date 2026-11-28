import { getDateDaysAgo, getToday } from 'shared/dates';
import {
  createDailyJobsStorage,
  renderDailyJob,
} from 'shared/dailyJobs/dailyJobsTestUtils';
import { DailyTask, ONCE_KEY } from '../../types';
import { useOnceReset } from './useOnceReset';

const createTask = (
  id: string,
  overrides: Partial<DailyTask> = {},
): DailyTask => ({
  id,
  description: id,
  category: '🧹',
  parentId: ONCE_KEY,
  position: 0,
  type: '一度',
  status: 'ready',
  lastCompleted: getDateDaysAgo(1),
  ...overrides,
});

async function resetTasks(tasks: DailyTask[]) {
  const storage = createDailyJobsStorage({
    [ONCE_KEY]: Object.fromEntries(tasks.map((task) => [task.id, task])),
  });
  await renderDailyJob(useOnceReset, storage);

  return storage;
}

describe('resetting one-off tasks at the start of the day', () => {
  describe('when a task was finished on an earlier day', () => {
    it('removes it and closes the gap in the positions', async () => {
      const storage = await resetTasks([
        createTask('book-flights', { status: 'finished', position: 0 }),
        createTask('post-parcel', { position: 1 }),
        createTask('call-bank', { position: 2 }),
      ]);

      expect(storage.updateList).toHaveBeenCalledWith(ONCE_KEY, [
        expect.objectContaining({ id: 'post-parcel', position: 0 }),
        expect.objectContaining({ id: 'call-bank', position: 1 }),
      ]);
    });
  });

  describe('when a task was finished today', () => {
    it('keeps it', async () => {
      const storage = await resetTasks([
        createTask('book-flights', {
          status: 'finished',
          lastCompleted: getToday(),
        }),
      ]);

      expect(storage.updateList).toHaveBeenCalledWith(ONCE_KEY, [
        expect.objectContaining({ id: 'book-flights', status: 'finished' }),
      ]);
    });
  });
});
