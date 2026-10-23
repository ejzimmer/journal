import { getDateDaysAgo, getToday } from '../../../shared/dates';
import {
  createDailyJobsStorage,
  renderDailyJob,
} from '../../../shared/dailyJobs/dailyJobsTestUtils';
import { DAILY_KEY, DailyTask } from '../../../shared/types';
import { useDailyReset } from './useDailyReset';

const yesterday = () => getDateDaysAgo(1);

const createTask = (
  id: string,
  overrides: Partial<DailyTask> = {},
): DailyTask => ({
  id,
  description: id,
  category: '🧹',
  parentId: DAILY_KEY,
  position: 0,
  type: '毎日',
  status: 'ready',
  lastCompleted: yesterday(),
  ...overrides,
});

const indexById = (tasks: DailyTask[]) =>
  Object.fromEntries(tasks.map((task) => [task.id, task]));

async function resetTasks(tasks: DailyTask[]) {
  const storage = createDailyJobsStorage({ [DAILY_KEY]: indexById(tasks) });
  await renderDailyJob(useDailyReset, storage);

  return storage;
}

describe('resetting daily tasks', () => {
  describe('a task done on an earlier day', () => {
    it('is ready again', async () => {
      const storage = await resetTasks([
        createTask('washing-up', { status: 'done', position: 0 }),
        createTask('exercise', { status: 'ready', position: 1 }),
      ]);

      expect(storage.updateList).toHaveBeenCalledWith(DAILY_KEY, [
        expect.objectContaining({ id: 'washing-up', status: 'ready' }),
        expect.objectContaining({ id: 'exercise', status: 'ready' }),
      ]);
    });
  });

  describe('a one-off task finished on an earlier day', () => {
    it('is removed', async () => {
      const storage = await resetTasks([
        createTask('book-flights', { type: '一度', status: 'finished' }),
        createTask('exercise', { position: 1 }),
      ]);

      expect(storage.updateList).toHaveBeenCalledWith(DAILY_KEY, [
        expect.objectContaining({ id: 'exercise' }),
      ]);
    });

    it('leaves no gap in the positions behind it', async () => {
      const storage = await resetTasks([
        createTask('book-flights', { type: '一度', status: 'finished' }),
        createTask('exercise', { position: 1 }),
        createTask('washing-up', { position: 2 }),
      ]);

      expect(storage.updateList).toHaveBeenCalledWith(DAILY_KEY, [
        expect.objectContaining({ id: 'exercise', position: 0 }),
        expect.objectContaining({ id: 'washing-up', position: 1 }),
      ]);
    });
  });

  describe('a one-off task finished today', () => {
    it('is left alone', async () => {
      const storage = await resetTasks([
        createTask('book-flights', {
          type: '一度',
          status: 'finished',
          lastCompleted: getToday(),
        }),
      ]);

      expect(storage.updateList).toHaveBeenCalledWith(DAILY_KEY, [
        expect.objectContaining({ id: 'book-flights', status: 'finished' }),
      ]);
    });
  });

  describe("when the tasks haven't arrived yet", () => {
    it('resets nothing', async () => {
      const storage = createDailyJobsStorage({});

      await renderDailyJob(useDailyReset, storage);

      expect(storage.updateList).not.toHaveBeenCalled();
    });

    it('resets them once they arrive', async () => {
      const storedValues: Record<string, unknown> = {};
      const storage = createDailyJobsStorage(storedValues);

      const { rerender } = await renderDailyJob(useDailyReset, storage);

      storedValues[DAILY_KEY] = indexById([
        createTask('washing-up', { status: 'done' }),
      ]);
      await rerender();

      expect(storage.updateList).toHaveBeenCalledWith(DAILY_KEY, [
        expect.objectContaining({ id: 'washing-up', status: 'ready' }),
      ]);
    });
  });

  describe('when the tasks are cached locally but not yet synced from the server', () => {
    it('waits for the server copy and resets that', async () => {
      let synced = false;
      const storedValues: Record<string, unknown> = {
        [DAILY_KEY]: indexById([createTask('stale', { status: 'done' })]),
      };
      const storage = createDailyJobsStorage(storedValues, {
        useValue: <T,>(key?: string) => ({
          value: key ? (storedValues[key] as T) : undefined,
          loading: false,
          synced: key !== DAILY_KEY || synced,
        }),
      });

      const { rerender } = await renderDailyJob(useDailyReset, storage);

      storedValues[DAILY_KEY] = indexById([
        createTask('current', { status: 'done' }),
      ]);
      synced = true;
      await rerender();

      expect(storage.updateList).toHaveBeenCalledTimes(1);
      expect(storage.updateList).toHaveBeenCalledWith(DAILY_KEY, [
        expect.objectContaining({ id: 'current', status: 'ready' }),
      ]);
    });
  });
});
