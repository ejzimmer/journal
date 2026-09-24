import { getTimestampDaysAgo } from '../../shared/dateTestUtils';
import {
  createDailyJobsStorage,
  renderDailyJob,
} from '../../shared/dailyJobs/dailyJobsTestUtils';
import { WorkTask, WORK_KEY } from './types';
import { useDoneTaskCleanup } from './useDoneTaskCleanup';

const createList = (
  id: string,
  description: string,
  position: number,
  items: WorkTask[] = [],
): WorkTask => ({
  id,
  description,
  status: 'not_started',
  parentId: WORK_KEY,
  lastStatusUpdate: new Date().getTime(),
  position,
  items: indexById(items),
});

const createTask = (
  listId: string,
  id: string,
  overrides: Partial<WorkTask> = {},
): WorkTask => ({
  id,
  description: id,
  status: 'not_started',
  parentId: `${WORK_KEY}/${listId}/items`,
  lastStatusUpdate: new Date().getTime(),
  position: 0,
  ...overrides,
});

const createDoneTask = (listId: string, id: string, doneOn: number) =>
  createTask(listId, id, {
    status: 'done',
    lastStatusUpdate: doneOn,
  });

function indexById(items: WorkTask[]) {
  return Object.fromEntries(items.map((item) => [item.id, item]));
}

function cleanUpLists(lists: WorkTask[]) {
  const storage = createDailyJobsStorage({ [WORK_KEY]: indexById(lists) });
  renderDailyJob(useDoneTaskCleanup, storage);

  return storage;
}

describe('cleaning up done work tasks', () => {
  describe('a task done on an earlier day', () => {
    it('moves to the done list', () => {
      const storage = cleanUpLists([
        createList('today', 'Today', 0, [
          createDoneTask('today', 'fix-the-thing', getTimestampDaysAgo(1)),
        ]),
        createList('done', 'Done', 1),
      ]);

      expect(storage.addItem).toHaveBeenCalledWith(
        `${WORK_KEY}/done/items`,
        expect.objectContaining({
          description: 'fix-the-thing',
          parentId: `${WORK_KEY}/done/items`,
        }),
      );
    });

    it('leaves the list it came from', () => {
      const storage = cleanUpLists([
        createList('today', 'Today', 0, [
          createDoneTask('today', 'fix-the-thing', getTimestampDaysAgo(1)),
        ]),
        createList('done', 'Done', 1),
      ]);

      expect(storage.updateList).toHaveBeenCalledWith(
        `${WORK_KEY}/today/items`,
        [],
      );
    });
  });

  describe('a task done today', () => {
    it('stays where it is', () => {
      const storage = cleanUpLists([
        createList('today', 'Today', 0, [
          createDoneTask('today', 'fix-the-thing', Date.now()),
        ]),
        createList('done', 'Done', 1),
      ]);

      expect(storage.addItem).not.toHaveBeenCalled();
      expect(storage.updateList).not.toHaveBeenCalled();
    });
  });

  describe('a list whose positions have gaps in them', () => {
    it('is renumbered', () => {
      const storage = cleanUpLists([
        createList('today', 'Today', 0, [
          createTask('today', 'fix-the-thing', { position: 7 }),
          createTask('today', 'another-thing', { position: 9 }),
        ]),
        createList('done', 'Done', 1),
      ]);

      expect(storage.updateList).toHaveBeenCalledWith(
        `${WORK_KEY}/today/items`,
        [
          expect.objectContaining({
            description: 'fix-the-thing',
            position: 0,
          }),
          expect.objectContaining({
            description: 'another-thing',
            position: 1,
          }),
        ],
      );
    });
  });

  describe('a list whose positions are already in order', () => {
    it("isn't written back", () => {
      const storage = cleanUpLists([
        createList('today', 'Today', 0, [
          createTask('today', 'fix-the-thing', { position: 0 }),
          createTask('today', 'another-thing', { position: 1 }),
        ]),
        createList('done', 'Done', 1),
      ]);

      expect(storage.updateList).not.toHaveBeenCalled();
    });
  });

  describe("when there's no done list", () => {
    it('cleans up nothing', () => {
      const storage = cleanUpLists([
        createList('today', 'Today', 0, [
          createDoneTask('today', 'fix-the-thing', getTimestampDaysAgo(1)),
        ]),
      ]);

      expect(storage.addItem).not.toHaveBeenCalled();
      expect(storage.updateList).not.toHaveBeenCalled();
    });
  });

  describe("when the lists haven't arrived yet", () => {
    it('cleans up nothing', () => {
      const storage = createDailyJobsStorage({});

      renderDailyJob(useDoneTaskCleanup, storage);

      expect(storage.addItem).not.toHaveBeenCalled();
      expect(storage.updateList).not.toHaveBeenCalled();
    });

    it('cleans them up once they arrive', () => {
      const storedValues: Record<string, unknown> = {};
      const storage = createDailyJobsStorage(storedValues);

      const { rerender } = renderDailyJob(useDoneTaskCleanup, storage);

      storedValues[WORK_KEY] = indexById([
        createList('today', 'Today', 0, [
          createDoneTask('today', 'fix-the-thing', getTimestampDaysAgo(1)),
        ]),
        createList('done', 'Done', 1),
      ]);
      rerender();

      expect(storage.addItem).toHaveBeenCalledWith(
        `${WORK_KEY}/done/items`,
        expect.objectContaining({ description: 'fix-the-thing' }),
      );
    });
  });
});
