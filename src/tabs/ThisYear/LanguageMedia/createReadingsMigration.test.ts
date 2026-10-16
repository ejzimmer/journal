import { createReadingsMigration } from './createReadingsMigration';
import { ItemUpdate, StoredMediaByYear } from './types';

const NOW = '2026-10-15T12:00:00Z';
const VOLUME_PATH = 'language_media/2026/yotsuba/volumes/vol1';

const createStore = (
  volume: Record<string, unknown>,
  seriesUpdates: Record<string, ItemUpdate> = {},
) =>
  ({
    2026: {
      yotsuba: {
        id: 'yotsuba',
        type: 'manga',
        name: 'よつばと！',
        language: 'japanese',
        volumes: { vol1: { id: 'vol1', number: 1, pages: 200, ...volume } },
        upTo: { volume: 1, page: 90 },
        updates: seriesUpdates,
      },
    },
  }) as unknown as StoredMediaByYear;

const upToUpdate = (at: string, page: number): ItemUpdate => ({
  at,
  changes: { upTo: { to: { volume: 1, page } } },
});

describe('createReadingsMigration', () => {
  describe('for a volume with a history of look-ups, AI questions and understood', () => {
    const migration = createReadingsMigration(
      createStore(
        {
          lookups: 3,
          aiQuestions: 1,
          understood: 60,
          updates: {
            u1: {
              at: '2026-10-03T09:00:00Z',
              changes: { lookups: { from: 0, to: 1 } },
            },
            u2: {
              at: '2026-10-03T10:00:00Z',
              changes: {
                lookups: { from: 1, to: 3 },
                aiQuestions: { from: 0, to: 1 },
              },
            },
            u3: {
              at: '2026-10-04T09:00:00Z',
              changes: { understood: { to: 60 } },
            },
            u4: {
              at: '2026-10-05T09:00:00Z',
              changes: { pages: { from: 180, to: 200 } },
            },
          },
        },
        {
          p1: upToUpdate('2026-10-03T08:00:00Z', 30),
          p2: upToUpdate('2026-10-04T08:00:00Z', 60),
          p3: upToUpdate('2026-10-04T10:00:00Z', 70),
        },
      ),
      NOW,
    );

    it('turns each day of it into one reading, at the page I was up to by the end of that day', () => {
      expect(migration).toMatchObject({
        [`${VOLUME_PATH}/readings/migrated-2026-10-03`]: {
          id: 'migrated-2026-10-03',
          createdAt: '2026-10-03T10:00:00Z',
          lookups: 3,
          aiQuestions: 1,
          page: 30,
        },
        [`${VOLUME_PATH}/readings/migrated-2026-10-04`]: {
          id: 'migrated-2026-10-04',
          createdAt: '2026-10-04T10:00:00Z',
          lookups: 0,
          aiQuestions: 0,
          understood: 60,
          page: 70,
        },
      });
    });

    it('makes no other readings', () => {
      expect(
        Object.keys(migration).filter((path) => path.includes('/readings/')),
      ).toHaveLength(2);
    });

    it('removes the totals from the volume', () => {
      expect(migration).toMatchObject({
        [`${VOLUME_PATH}/lookups`]: null,
        [`${VOLUME_PATH}/aiQuestions`]: null,
        [`${VOLUME_PATH}/understood`]: null,
      });
    });
  });

  describe('for a day when I only saved a page', () => {
    const migration = createReadingsMigration(
      createStore(
        {
          lookups: 1,
          aiQuestions: 0,
          updates: {
            u1: {
              at: '2026-10-03T09:00:00Z',
              changes: { lookups: { from: 0, to: 1 } },
            },
          },
        },
        {
          migration: upToUpdate('2026-10-01T09:00:00Z', 10),
          p1: upToUpdate('2026-10-05T09:00:00Z', 80),
        },
      ),
      NOW,
    );

    it('makes a reading of just that page', () => {
      expect(migration[`${VOLUME_PATH}/readings/migrated-2026-10-05`]).toEqual({
        id: 'migrated-2026-10-05',
        createdAt: '2026-10-05T09:00:00Z',
        lookups: 0,
        aiQuestions: 0,
        page: 80,
      });
    });

    it('makes no reading of the page brought in from the old reading goal', () => {
      expect(
        Object.keys(migration).filter((path) => path.includes('/readings/')),
      ).toEqual([
        `${VOLUME_PATH}/readings/migrated-2026-10-03`,
        `${VOLUME_PATH}/readings/migrated-2026-10-05`,
      ]);
    });
  });

  describe('for readings with no understood of their own', () => {
    const migration = createReadingsMigration(
      createStore(
        {
          lookups: 3,
          aiQuestions: 0,
          understood: 85,
          updates: {
            u1: {
              at: '2026-10-12T09:00:00Z',
              changes: { understood: { to: 85 } },
            },
            u2: {
              at: '2026-10-13T09:00:00Z',
              changes: { lookups: { from: 0, to: 3 } },
            },
          },
        },
        {
          p1: upToUpdate('2026-10-04T09:00:00Z', 40),
          p2: upToUpdate('2026-10-14T09:00:00Z', 90),
        },
      ),
      NOW,
    );
    const understoodOn = (date: string) =>
      (
        migration[`${VOLUME_PATH}/readings/migrated-${date}`] as {
          understood?: number;
        }
      ).understood;

    it('carries the understood from before them forward', () => {
      expect(understoodOn('2026-10-13')).toBe(85);
      expect(understoodOn('2026-10-14')).toBe(85);
    });

    it('gives the ones before any understood the first one saved', () => {
      expect(understoodOn('2026-10-04')).toBe(85);
    });
  });

  describe('for a volume with totals and no history', () => {
    it('makes one reading of them, now, at the page I am up to', () => {
      const migration = createReadingsMigration(
        createStore({ lookups: 5, aiQuestions: 1, understood: 54 }),
        NOW,
      );

      expect(migration[`${VOLUME_PATH}/readings/migrated-remainder`]).toEqual({
        id: 'migrated-remainder',
        createdAt: NOW,
        lookups: 5,
        aiQuestions: 1,
        understood: 54,
        page: 90,
      });
    });
  });

  describe('for a volume with more in its totals than in its history', () => {
    it('makes a reading of the difference', () => {
      const migration = createReadingsMigration(
        createStore({
          lookups: 7,
          aiQuestions: 0,
          updates: {
            u1: {
              at: '2026-10-03T09:00:00Z',
              changes: { lookups: { from: 5, to: 7 } },
            },
          },
        }),
        NOW,
      );

      expect(migration).toMatchObject({
        [`${VOLUME_PATH}/readings/migrated-2026-10-03`]: { lookups: 2 },
        [`${VOLUME_PATH}/readings/migrated-remainder`]: { lookups: 5 },
      });
    });
  });

  describe('for a volume with nothing recorded', () => {
    it('only removes the empty totals', () => {
      const migration = createReadingsMigration(
        createStore({ lookups: 0, aiQuestions: 0 }),
        NOW,
      );

      expect(migration).toEqual({
        [`${VOLUME_PATH}/lookups`]: null,
        [`${VOLUME_PATH}/aiQuestions`]: null,
        [`${VOLUME_PATH}/understood`]: null,
      });
    });
  });

  describe('once every volume has readings', () => {
    it('has nothing to change', () => {
      const migration = createReadingsMigration(
        createStore({
          readings: {
            r1: { id: 'r1', createdAt: NOW, lookups: 1, aiQuestions: 0 },
          },
        }),
        NOW,
      );

      expect(migration).toEqual({});
    });
  });
});
