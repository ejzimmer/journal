import { createProgressUpdateMigration } from './createProgressUpdateMigration';
import { LegacyUpdate } from './legacyUpdates';
import { StoredMediaByYear } from './types';

const NOW = '2026-10-15T12:00:00Z';
const SERIES_PATH = 'language_media/2026/yotsuba';
const VOLUME_PATH = `${SERIES_PATH}/volumes/vol1`;
const UPDATES_PATH = `${VOLUME_PATH}/updates`;

const createStore = (
  volume: Record<string, unknown>,
  seriesUpdates: Record<string, LegacyUpdate> = {},
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

const migrate = (store: StoredMediaByYear) => {
  let count = 0;
  return createProgressUpdateMigration(store, NOW, () => `id-${++count}`);
};

const migrateUpdates = (store: StoredMediaByYear) =>
  migrate(store)[UPDATES_PATH] as Record<string, unknown>;

const upToUpdate = (at: string, page: number): LegacyUpdate => ({
  at,
  changes: { upTo: { to: { volume: 1, page } } },
});

describe('createProgressUpdateMigration', () => {
  describe('for a volume with a history of look-ups, AI questions and understood', () => {
    const migration = migrate(
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
    );

    it('replaces its history with one update for each day, at the page I was up to by the end of that day', () => {
      expect(migration[UPDATES_PATH]).toEqual({
        'id-1': {
          at: '2026-10-03T10:00:00Z',
          lookups: 3,
          aiQuestions: 1,
          understood: 60,
          page: 30,
        },
        'id-2': {
          at: '2026-10-04T10:00:00Z',
          lookups: 0,
          aiQuestions: 0,
          understood: 60,
          page: 70,
        },
      });
    });

    it('removes the history of the series', () => {
      expect(migration[`${SERIES_PATH}/updates`]).toBeNull();
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
    const migration = migrate(
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
    );

    it('makes an update of just that page', () => {
      expect(migration[UPDATES_PATH]).toMatchObject({
        'id-2': {
          at: '2026-10-05T09:00:00Z',
          lookups: 0,
          aiQuestions: 0,
          page: 80,
        },
      });
    });

    it('makes no update of the page brought in from the old reading goal', () => {
      expect(Object.keys(migration[UPDATES_PATH] as object)).toEqual([
        'id-1',
        'id-2',
      ]);
    });
  });

  describe('for updates with no understood of their own', () => {
    const migration = migrate(
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
    );
    const understoodOn = (id: string) =>
      (migration[UPDATES_PATH] as Record<string, { understood?: number }>)[id]
        .understood;

    it('carries the understood from before them forward', () => {
      expect(understoodOn('id-3')).toBe(85);
      expect(understoodOn('id-4')).toBe(85);
    });

    it('gives the ones before any understood the first one saved', () => {
      expect(understoodOn('id-1')).toBe(85);
    });
  });

  describe('for a volume with totals and no history', () => {
    it('makes one update of them, now, at the page I am up to', () => {
      expect(
        migrateUpdates(
          createStore({ lookups: 5, aiQuestions: 1, understood: 54 }),
        ),
      ).toEqual({
        'id-1': {
          at: NOW,
          lookups: 5,
          aiQuestions: 1,
          understood: 54,
          page: 90,
        },
      });
    });
  });

  describe('for a volume with more in its totals than in its history', () => {
    it('makes an update of the difference', () => {
      const updates = migrateUpdates(
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
      );

      expect(updates).toMatchObject({
        'id-1': { lookups: 2 },
        'id-2': { lookups: 5 },
      });
    });
  });

  describe('for a volume with nothing recorded', () => {
    it('only removes the empty totals', () => {
      const migration = migrate(createStore({ lookups: 0, aiQuestions: 0 }));

      expect(migration).toEqual({
        [UPDATES_PATH]: null,
        [`${VOLUME_PATH}/lookups`]: null,
        [`${VOLUME_PATH}/aiQuestions`]: null,
        [`${VOLUME_PATH}/understood`]: null,
      });
    });
  });

  describe('once every volume has been migrated', () => {
    it('has nothing to change', () => {
      const migration = migrate(
        createStore({
          updates: { u1: { at: NOW, lookups: 1, aiQuestions: 0 } },
        }),
      );

      expect(migration).toEqual({});
    });
  });
});
