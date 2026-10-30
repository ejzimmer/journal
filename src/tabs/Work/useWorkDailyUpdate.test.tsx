import { getDateDaysAgo, getDateDaysAhead, getToday } from '../../shared/dates';
import {
  createDailyJobsStorage,
  renderDailyJob,
} from '../../shared/dailyJobs/dailyJobsTestUtils';
import { WorkTask, WORK_KEY } from './types';
import { useWorkDailyUpdate } from './useWorkDailyUpdate';

const createList = (
  id: string,
  description: string,
  position: number,
  items: WorkTask[] = [],
  labelIds?: string[],
): WorkTask => ({
  id,
  description,
  labelIds,
  status: 'not_started',
  parentId: WORK_KEY,
  lastStatusUpdate: getToday(),
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
  lastStatusUpdate: getToday(),
  position: 0,
  ...overrides,
});

const createDoneTask = (listId: string, id: string, doneOn: string) =>
  createTask(listId, id, {
    status: 'done',
    lastStatusUpdate: doneOn,
  });

function indexById(items: WorkTask[]) {
  return Object.fromEntries(items.map((item) => [item.id, item]));
}

async function updateLists(lists: WorkTask[]) {
  const storage = createDailyJobsStorage({ [WORK_KEY]: indexById(lists) });
  await renderDailyJob(useWorkDailyUpdate, storage);

  return storage;
}

describe('the daily work update', () => {
  describe('a task done on an earlier day', () => {
    it('moves to the done list', async () => {
      const storage = await updateLists([
        createList('today', 'Today', 0, [
          createDoneTask('today', 'fix-the-thing', getDateDaysAgo(1)),
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

    it('goes after the tasks already in the done list', async () => {
      const storage = await updateLists([
        createList('today', 'Today', 0, [
          createDoneTask('today', 'fix-the-thing', getDateDaysAgo(1)),
          createTask('today', 'ship-the-thing', {
            status: 'done',
            lastStatusUpdate: getDateDaysAgo(1),
            position: 1,
          }),
        ]),
        createList('done', 'Done', 1, [
          createTask('done', 'old-thing', { status: 'done', position: 3 }),
        ]),
      ]);

      expect(storage.addItem).toHaveBeenCalledWith(
        `${WORK_KEY}/done/items`,
        expect.objectContaining({ description: 'fix-the-thing', position: 4 }),
      );
      expect(storage.addItem).toHaveBeenCalledWith(
        `${WORK_KEY}/done/items`,
        expect.objectContaining({ description: 'ship-the-thing', position: 5 }),
      );
    });

    it('leaves the list it came from', async () => {
      const storage = await updateLists([
        createList('today', 'Today', 0, [
          createDoneTask('today', 'fix-the-thing', getDateDaysAgo(1)),
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
    it('stays where it is', async () => {
      const storage = await updateLists([
        createList('today', 'Today', 0, [
          createDoneTask('today', 'fix-the-thing', getToday()),
        ]),
        createList('done', 'Done', 1),
      ]);

      expect(storage.addItem).not.toHaveBeenCalled();
      expect(storage.updateList).not.toHaveBeenCalled();
    });
  });

  describe('a list whose positions have gaps in them', () => {
    it('is renumbered', async () => {
      const storage = await updateLists([
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
    it("isn't written back", async () => {
      const storage = await updateLists([
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
    it('cleans up nothing', async () => {
      const storage = await updateLists([
        createList('today', 'Today', 0, [
          createDoneTask('today', 'fix-the-thing', getDateDaysAgo(1)),
        ]),
      ]);

      expect(storage.addItem).not.toHaveBeenCalled();
      expect(storage.updateList).not.toHaveBeenCalled();
    });
  });

  describe('a task due today', () => {
    const dueToday = (listId: string, id: string, position = 0) =>
      createTask(listId, id, { dueDate: getToday(), position });

    describe('in another list', () => {
      const lists = () => [
        createList('today', 'Today', 0, [createTask('today', 'already-today')]),
        createList(
          'backlog',
          'Backlog',
          1,
          [dueToday('backlog', 'fix-the-thing')],
          ['backlog-label'],
        ),
        createList('done', 'Done', 2),
      ];

      it('moves to the top of the Today list', async () => {
        const storage = await updateLists(lists());

        expect(storage.updateList).toHaveBeenCalledWith(
          `${WORK_KEY}/today/items`,
          [
            expect.objectContaining({
              id: 'fix-the-thing',
              parentId: `${WORK_KEY}/today/items`,
              position: 0,
            }),
            expect.objectContaining({ id: 'already-today', position: 1 }),
          ],
        );
      });

      it('leaves the list it came from', async () => {
        const storage = await updateLists(lists());

        expect(storage.updateList).toHaveBeenCalledWith(
          `${WORK_KEY}/backlog/items`,
          [],
        );
      });

      it('is labelled with the list it came from', async () => {
        const storage = await updateLists(lists());

        expect(storage.updateList).toHaveBeenCalledWith(
          `${WORK_KEY}/today/items`,
          expect.arrayContaining([
            expect.objectContaining({
              id: 'fix-the-thing',
              labelIds: ['backlog-label'],
            }),
          ]),
        );
      });
    });

    describe('already in the Today list', () => {
      it('moves to the top of it', async () => {
        const storage = await updateLists([
          createList('today', 'Today', 0, [
            createTask('today', 'already-today', { position: 0 }),
            dueToday('today', 'fix-the-thing', 1),
          ]),
        ]);

        expect(storage.updateList).toHaveBeenCalledWith(
          `${WORK_KEY}/today/items`,
          [
            expect.objectContaining({ id: 'fix-the-thing', position: 0 }),
            expect.objectContaining({ id: 'already-today', position: 1 }),
          ],
        );
      });
    });

    describe('that is already done', () => {
      it('stays where it is', async () => {
        const storage = await updateLists([
          createList('today', 'Today', 0),
          createList('backlog', 'Backlog', 1, [
            createTask('backlog', 'fix-the-thing', {
              dueDate: getToday(),
              status: 'done',
            }),
          ]),
        ]);

        expect(storage.updateList).not.toHaveBeenCalled();
      });
    });

    describe('in the done list', () => {
      it('stays where it is', async () => {
        const storage = await updateLists([
          createList('today', 'Today', 0),
          createList('done', 'Done', 1, [dueToday('done', 'fix-the-thing')]),
        ]);

        expect(storage.updateList).not.toHaveBeenCalled();
      });
    });

    describe("when there's no Today list", () => {
      it('stays where it is', async () => {
        const storage = await updateLists([
          createList('backlog', 'Backlog', 0, [
            dueToday('backlog', 'fix-the-thing'),
          ]),
        ]);

        expect(storage.updateList).not.toHaveBeenCalled();
      });
    });
  });

  describe('tasks due today in different lists', () => {
    it('keeps the order of the lists they came from', async () => {
      const storage = await updateLists([
        createList('today', 'Today', 0),
        createList('later', 'Later', 2, [
          createTask('later', 'later-thing', { dueDate: getToday() }),
        ]),
        createList('backlog', 'Backlog', 1, [
          createTask('backlog', 'second-backlog-thing', {
            dueDate: getToday(),
            position: 1,
          }),
          createTask('backlog', 'first-backlog-thing', { dueDate: getToday() }),
        ]),
      ]);

      expect(storage.updateList).toHaveBeenCalledWith(
        `${WORK_KEY}/today/items`,
        [
          expect.objectContaining({ id: 'first-backlog-thing' }),
          expect.objectContaining({ id: 'second-backlog-thing' }),
          expect.objectContaining({ id: 'later-thing' }),
        ],
      );
    });
  });

  describe('a task due on an earlier day', () => {
    it('moves to the top of the Today list', async () => {
      const storage = await updateLists([
        createList('today', 'Today', 0, [createTask('today', 'already-today')]),
        createList('backlog', 'Backlog', 1, [
          createTask('backlog', 'fix-the-thing', {
            dueDate: getDateDaysAgo(3),
          }),
        ]),
      ]);

      expect(storage.updateList).toHaveBeenCalledWith(
        `${WORK_KEY}/today/items`,
        [
          expect.objectContaining({ id: 'fix-the-thing', position: 0 }),
          expect.objectContaining({ id: 'already-today', position: 1 }),
        ],
      );
    });
  });

  describe('a task due on a later day', () => {
    it('stays where it is', async () => {
      const storage = await updateLists([
        createList('today', 'Today', 0),
        createList('backlog', 'Backlog', 1, [
          createTask('backlog', 'fix-the-thing', {
            dueDate: getDateDaysAhead(1),
          }),
        ]),
      ]);

      expect(storage.updateList).not.toHaveBeenCalled();
    });
  });

  describe("when the lists haven't arrived yet", () => {
    it('cleans up nothing', async () => {
      const storage = createDailyJobsStorage({});

      await renderDailyJob(useWorkDailyUpdate, storage);

      expect(storage.addItem).not.toHaveBeenCalled();
      expect(storage.updateList).not.toHaveBeenCalled();
    });

    it('cleans them up once they arrive', async () => {
      const storedValues: Record<string, unknown> = {};
      const storage = createDailyJobsStorage(storedValues);

      const { rerender } = await renderDailyJob(useWorkDailyUpdate, storage);

      storedValues[WORK_KEY] = indexById([
        createList('today', 'Today', 0, [
          createDoneTask('today', 'fix-the-thing', getDateDaysAgo(1)),
        ]),
        createList('done', 'Done', 1),
      ]);
      await rerender();

      expect(storage.addItem).toHaveBeenCalledWith(
        `${WORK_KEY}/done/items`,
        expect.objectContaining({ description: 'fix-the-thing' }),
      );
    });
  });
});
