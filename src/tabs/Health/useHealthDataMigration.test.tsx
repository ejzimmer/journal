import { ReactNode } from 'react';
import { renderHook } from '@testing-library/react';
import { StorageContextWrapper } from '../../shared/storageContextTestUtils';
import {
  LEGACY_DAILY_PATH,
  LEGACY_EXERCISES_PATH,
  LEGACY_GOALS_PATH,
  createCompletedListUpdates,
  createItemMoveUpdates,
  useHealthDataMigration,
} from './useHealthDataMigration';

function runMigration(storedValues: Record<string, unknown>) {
  const setValues = jest.fn();
  renderHook(useHealthDataMigration, {
    wrapper: ({ children }: { children: ReactNode }) => (
      <StorageContextWrapper
        value={{
          useValue: <T,>(key?: string) => ({
            value: key ? (storedValues[key] as T) : undefined,
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

describe('useHealthDataMigration', () => {
  describe('when there is calorie data under the year', () => {
    const legacyDaily = {
      '2026-01-06': { id: '2026-01-06', consumed: 1800, expended: 2200 },
      '2026-01-07': { id: '2026-01-07', trackers: ['🔴'] },
    };

    it('moves every day to health and removes the old data in one write', () => {
      const setValues = runMigration({ [LEGACY_DAILY_PATH]: legacyDaily });

      expect(setValues).toHaveBeenCalledWith({
        'health/daily/2026-01-06': legacyDaily['2026-01-06'],
        'health/daily/2026-01-07': legacyDaily['2026-01-07'],
        '2026/daily': null,
      });
    });

    describe('and some of those days are already under health', () => {
      it('keeps the days already under health', () => {
        const setValues = runMigration({
          [LEGACY_DAILY_PATH]: legacyDaily,
          'health/daily': {
            '2026-01-07': { id: '2026-01-07', trackers: ['🔴', '💧'] },
          },
        });

        expect(setValues).toHaveBeenCalledWith({
          'health/daily/2026-01-06': legacyDaily['2026-01-06'],
          '2026/daily': null,
        });
      });
    });
  });

  describe('when there are exercises under the year', () => {
    it('moves them to health and removes the old data in one write', () => {
      const squat = { id: 'squat', name: 'Goblet squat' };
      const setValues = runMigration({
        [LEGACY_EXERCISES_PATH]: { squat },
      });

      expect(setValues).toHaveBeenCalledWith({
        'health/exercises/squat': squat,
        '2026/exercises': null,
      });
    });
  });

  describe('when there is no health data under the year', () => {
    it("doesn't write anything", () => {
      const setValues = runMigration({
        'health/daily': { '2026-01-06': { id: '2026-01-06', consumed: 1800 } },
        [LEGACY_GOALS_PATH]: {
          reading: { id: 'reading', description: 'Read', status: 'ready' },
        },
      });

      expect(setValues).not.toHaveBeenCalled();
    });
  });
});

describe('createItemMoveUpdates', () => {
  const pistolSquat = {
    id: 'pistol',
    description: 'Progress to Pistol Squat',
    times: [{ id: 'week-1', total: 6, completed: 2 }],
  };
  const otherGoals = {
    pistol: pistolSquat,
    reading: { id: 'reading', description: 'Read', times: [] },
  };

  describe('when a named item is under the old path', () => {
    it('copies it unchanged to the new path and removes it from the old one, leaving the other items', () => {
      expect(
        createItemMoveUpdates(
          '2026/other_goals',
          'health/classes',
          ['pistol'],
          otherGoals,
        ),
      ).toEqual({
        'health/classes/pistol': pistolSquat,
        '2026/other_goals/pistol': null,
      });
    });

    describe('and it is already under the new path', () => {
      it('keeps the new copy and removes the old one', () => {
        expect(
          createItemMoveUpdates(
            '2026/other_goals',
            'health/classes',
            ['pistol'],
            otherGoals,
            { pistol: { ...pistolSquat, description: 'Pistol' } },
          ),
        ).toEqual({ '2026/other_goals/pistol': null });
      });
    });
  });

  describe('when a named item has already been moved away', () => {
    it('has nothing to write', () => {
      expect(
        createItemMoveUpdates(
          '2026/other_goals',
          'health/classes',
          ['pistol'],
          {
            reading: otherGoals.reading,
          },
        ),
      ).toEqual({});
    });
  });
});

describe('createCompletedListUpdates', () => {
  describe('when a class has counts of completed classes', () => {
    it('replaces each count with a list of that many classes from the start', () => {
      expect(
        createCompletedListUpdates({
          pistol: {
            times: [{ completed: 3 }, { completed: 1 }],
          },
        }),
      ).toEqual({
        'health/classes/pistol/times/0/completed': [0, 1, 2],
        'health/classes/pistol/times/1/completed': [0],
      });
    });

    describe('and a count is zero', () => {
      it('removes it', () => {
        expect(
          createCompletedListUpdates({
            pistol: { times: [{ completed: 0 }] },
          }),
        ).toEqual({ 'health/classes/pistol/times/0/completed': null });
      });
    });
  });

  describe('when a class already has lists of completed classes', () => {
    it('has nothing to write', () => {
      expect(
        createCompletedListUpdates({
          pistol: { times: [{ completed: [0, 2] }, {}] },
        }),
      ).toEqual({});
    });
  });
});
