import { ReactNode } from 'react';
import { renderHook } from '@testing-library/react';
import { StorageContextWrapper } from '../../shared/storageContextTestUtils';
import {
  LEGACY_DAILY_PATH,
  LEGACY_EXERCISES_PATH,
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
      });

      expect(setValues).not.toHaveBeenCalled();
    });
  });
});
