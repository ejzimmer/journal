import { Database } from 'firebase/database';
import {
  getMockServerData,
  mockUpdate,
  resetMockDatabase,
  setMockServerData,
} from 'shared/localFirst/firebaseDatabaseTestUtils';
import { migrateFromJournal } from './migrateFromJournal';

jest.mock(
  'firebase/database',
  () =>
    jest.requireActual('shared/localFirst/firebaseDatabaseTestUtils')
      .firebaseDatabaseMock,
);

const database = {} as Database;

const createJournalProject = (
  id: string,
  description: string,
  fields: Record<string, unknown> = {},
) => ({
  id,
  description,
  category: '🧶',
  position: 1,
  status: 'ready',
  ...fields,
});

async function migrate(v2: Record<string, unknown>) {
  setMockServerData({ v2 });
  await migrateFromJournal(database);
  return mockUpdate.mock.calls[0]?.[0];
}

describe('migrating from the journal', () => {
  beforeEach(() => {
    resetMockDatabase();
    mockUpdate.mockClear();
  });

  describe('knitting projects', () => {
    it('copies their name and steps, without the todo links', async () => {
      const updates = await migrate({
        projects: {
          cardi: createJournalProject('cardi', 'Cardigan', {
            subtasks: {
              swatch: {
                id: 'swatch',
                description: 'Swatch',
                status: 'done',
                position: 1,
                category: '🧶',
                linkedId: 'todo-1',
              },
            },
          }),
        },
      });

      expect(updates['projects/cardi']).toEqual({
        id: 'cardi',
        name: 'Cardigan',
        type: 'cardigan',
        subtasks: {
          swatch: {
            id: 'swatch',
            description: 'Swatch',
            status: 'done',
            position: 1,
          },
        },
      });
    });

    it('leaves out projects from other categories', async () => {
      const updates = await migrate({
        projects: {
          cardi: createJournalProject('cardi', 'Cardigan'),
          shelves: createJournalProject('shelves', 'Build shelves', {
            category: '🧹',
          }),
        },
      });

      expect(Object.keys(updates)).toEqual([
        'projects/cardi',
        'lists/future/cardi',
      ]);
    });

    describe('when a project tracks socks', () => {
      it('becomes a socks project with its progress', async () => {
        const socks = {
          direction: 'toe_up',
          knittedSections: { first: 6, second: 3 },
        };

        const updates = await migrate({
          projects: {
            dad: createJournalProject('dad', 'Socks for Dad', {
              category: '🧦',
              socks,
            }),
          },
        });

        expect(updates['projects/dad']).toEqual({
          id: 'dad',
          name: 'Socks for Dad',
          type: 'socks',
          socks,
        });
      });
    });

    describe('when the name is a Ravelry link', () => {
      it('takes the name and pattern link from it', async () => {
        const updates = await migrate({
          projects: {
            vest: createJournalProject(
              'vest',
              'https://www.ravelry.com/patterns/library/unabridged',
            ),
          },
        });

        expect(updates['projects/vest']).toEqual({
          id: 'vest',
          name: 'Unabridged',
          type: 'vest',
          pattern: {
            name: 'Unabridged',
            url: 'https://www.ravelry.com/patterns/library/unabridged',
          },
        });
      });

      describe('when it was mangled by a copy from Trello', () => {
        it('still finds the pattern', async () => {
          const updates = await migrate({
            projects: {
              hat: createJournalProject(
                'hat',
                'https://trello.com/c/20tHDw4m/2740-https-wwwravelrycom-patterns-library-lucca-hat',
              ),
            },
          });

          expect(updates['projects/hat']).toMatchObject({
            name: 'Lucca Hat',
            type: 'hat',
            pattern: {
              url: 'https://www.ravelry.com/patterns/library/lucca-hat',
            },
          });
        });
      });
    });

    describe('choosing a type from the name', () => {
      it.each([
        ['Laptop sleeve', 'accessory'],
        ['Hat band', 'accessory'],
        ['Bolero', 'cardigan'],
        ['Jacket', 'cardigan'],
        ['Granny square blanket', 'blanket'],
        ['Cabled jumper', 'jumper'],
        ['Brioche shawl', 'shawl'],
        ['Unicorn', 'amigurumi'],
        ['Something new', 'accessory'],
      ])('makes %s a %s', async (description, type) => {
        const updates = await migrate({
          projects: { project: createJournalProject('project', description) },
        });

        expect(updates['projects/project'].type).toBe(type);
      });
    });
  });

  describe('lists', () => {
    it('puts projects in progress on the left and the rest in the future, keeping their order', async () => {
      const updates = await migrate({
        projects: {
          blanket: createJournalProject('blanket', 'Blanket', {
            status: 'in_progress',
            position: 2,
          }),
          sleeve: createJournalProject('sleeve', 'Laptop sleeve', {
            status: 'in_progress',
            position: 1,
          }),
          cardi: createJournalProject('cardi', 'Cardigan', { position: 3 }),
          hat: createJournalProject('hat', 'Hat', {
            status: 'done',
            position: 4,
          }),
        },
      });

      expect(updates).toMatchObject({
        'lists/meetings/sleeve': { id: 'sleeve', position: 1 },
        'lists/meetings/blanket': { id: 'blanket', position: 2 },
        'lists/future/cardi': { id: 'cardi', position: 1 },
        'lists/future/hat': { id: 'hat', position: 2 },
      });
    });
  });

  describe('yarn', () => {
    it('copies the yarn bowl unchanged', async () => {
      const yarn = {
        '2026': { wool: { id: 'wool', history: { '2026-01': 4732 } } },
      };

      const updates = await migrate({ yarn });

      expect(updates.yarn).toEqual(yarn);
    });
  });

  describe('running only once', () => {
    it('leaves Amimono alone when it has already run', async () => {
      await migrate({ amimono: { migratedFromJournalAt: 1 } });

      expect(mockUpdate).not.toHaveBeenCalled();
    });

    it('records that it ran', async () => {
      await migrate({});

      expect(getMockServerData()).toMatchObject({
        v2: { amimono: { migratedFromJournalAt: expect.any(Number) } },
      });
    });
  });
});
