import { ReactNode } from 'react';
import { renderHook } from '@testing-library/react';
import { StorageContextWrapper } from '../../../shared/storageContextTestUtils';
import {
  LEGACY_GOALS_PATH,
  useReadingGoalMigration,
} from './useReadingGoalMigration';

const NOW = '2026-10-03T03:00:00Z';
const MIGRATION = { at: NOW };

function runMigration(legacyGoals?: Record<string, unknown>) {
  const setValues = jest.fn();
  renderHook(useReadingGoalMigration, {
    wrapper: ({ children }: { children: ReactNode }) => (
      <StorageContextWrapper
        value={{
          useValue: <T,>(key?: string) => ({
            value: (key === LEGACY_GOALS_PATH ? legacyGoals : undefined) as T,
            loading: false,
          }),
          setValues,
        }}
      >
        {children}
      </StorageContextWrapper>
    ),
  });
  return setValues;
}

const bikes = { id: 'bikes', bikes: [{ name: 'Brompton', isDone: true }] };

describe('useReadingGoalMigration', () => {
  beforeEach(() => {
    jest
      .spyOn(Temporal.Now, 'instant')
      .mockReturnValue(Temporal.Instant.from(NOW));
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('when there are french books in the other goals', () => {
    const legacyGoals = {
      hp1: {
        id: 'hp1',
        title: "Harry Potter à l'école des sorciers",
        volumes: [{ totalPages: 310, readPages: 310 }],
      },
      hp2: {
        id: 'hp2',
        title: 'Harry Potter et la chambre des secrets',
        volumes: [{ totalPages: 360, readPages: 120 }],
      },
      hp3: {
        id: 'hp3',
        title: "Harry Potter et le prisonnier d'Azkaban",
        volumes: [{ totalPages: 450 }],
      },
      bikes,
    };

    it('moves them into one book series named after the words their titles share', () => {
      const setValues = runMigration(legacyGoals);

      expect(setValues).toHaveBeenCalledWith(
        expect.objectContaining({
          'language_media/2026/hp1': expect.objectContaining({
            id: 'hp1',
            type: 'book',
            name: 'Harry Potter',
            language: 'french',
            createdAt: NOW,
          }),
        }),
      );
    });

    it('makes each book a volume named after it', () => {
      const setValues = runMigration(legacyGoals);

      const { volumes } = setValues.mock.calls[0][0]['language_media/2026/hp1'];
      expect(Object.values(volumes)).toEqual([
        expect.objectContaining({
          id: 'hp1-1',
          number: 1,
          name: "Harry Potter à l'école des sorciers",
          pages: 310,
          lookups: 0,
          aiQuestions: 0,
          createdAt: NOW,
        }),
        expect.objectContaining({
          id: 'hp2-1',
          number: 2,
          name: 'Harry Potter et la chambre des secrets',
          pages: 360,
        }),
        expect.objectContaining({
          id: 'hp3-1',
          number: 3,
          name: "Harry Potter et le prisonnier d'Azkaban",
          pages: 450,
        }),
      ]);
    });

    it('records the finished books as done in one update', () => {
      const setValues = runMigration(legacyGoals);

      const { volumes } = setValues.mock.calls[0][0]['language_media/2026/hp1'];
      expect(volumes['hp1-1']).toMatchObject({
        status: 'done',
        updates: {
          migration: { ...MIGRATION, changes: { status: { to: 'done' } } },
        },
      });
    });

    it('records the furthest page read as the up to in one update', () => {
      const setValues = runMigration(legacyGoals);

      expect(
        setValues.mock.calls[0][0]['language_media/2026/hp1'],
      ).toMatchObject({
        upTo: { volume: 2, page: 120 },
        updates: {
          migration: {
            ...MIGRATION,
            changes: { upTo: { to: { volume: 2, page: 120 } } },
          },
        },
      });
    });

    it('removes the books from the other goals in the same write', () => {
      const setValues = runMigration(legacyGoals);

      expect(setValues).toHaveBeenCalledWith(
        expect.objectContaining({
          '2026/other_goals/hp1': null,
          '2026/other_goals/hp2': null,
          '2026/other_goals/hp3': null,
        }),
      );
    });

    it('leaves the other goals that are not books', () => {
      const setValues = runMigration(legacyGoals);

      expect(Object.keys(setValues.mock.calls[0][0])).toEqual([
        'language_media/2026/hp1',
        '2026/other_goals/hp1',
        '2026/other_goals/hp2',
        '2026/other_goals/hp3',
      ]);
    });

    describe('and a book has more than one volume', () => {
      it('numbers each volume after the book', () => {
        const setValues = runMigration({
          lesmis: {
            id: 'lesmis',
            title: 'Les Misérables',
            volumes: [{ totalPages: 520 }, { totalPages: 480 }],
          },
        });

        const { name, volumes } =
          setValues.mock.calls[0][0]['language_media/2026/lesmis'];
        expect(name).toBe('Les Misérables');
        expect(Object.values(volumes)).toEqual([
          expect.objectContaining({ number: 1, name: 'Les Misérables 1' }),
          expect.objectContaining({ number: 2, name: 'Les Misérables 2' }),
        ]);
      });
    });
  });

  describe('when there is a japanese book in the other goals', () => {
    const legacyGoals = {
      yotsuba: {
        id: 'yotsuba',
        title: 'よつばと！',
        volumes: [{ totalPages: 224, readPages: 40 }],
      },
    };

    it('moves it into a manga series with it as the first volume', () => {
      const setValues = runMigration(legacyGoals);

      expect(setValues).toHaveBeenCalledWith({
        'language_media/2026/yotsuba': {
          id: 'yotsuba',
          type: 'manga',
          name: 'よつばと！',
          language: 'japanese',
          createdAt: NOW,
          volumes: {
            'yotsuba-1': {
              id: 'yotsuba-1',
              number: 1,
              pages: 224,
              lookups: 0,
              aiQuestions: 0,
              createdAt: NOW,
            },
          },
          upTo: { volume: 1, page: 40 },
          updates: {
            migration: {
              ...MIGRATION,
              changes: { upTo: { to: { volume: 1, page: 40 } } },
            },
          },
        },
        '2026/other_goals/yotsuba': null,
      });
    });
  });

  describe('when none of the other goals are books', () => {
    it('writes nothing', () => {
      const setValues = runMigration({ bikes });

      expect(setValues).not.toHaveBeenCalled();
    });
  });
});
