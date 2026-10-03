import { ReactNode } from 'react';
import { renderHook } from '@testing-library/react';
import { StorageContextWrapper } from '../../../shared/storageContextTestUtils';
import {
  LEGACY_GOALS_PATH,
  useWindWakerMigration,
} from './useWindWakerMigration';

function runMigration(legacyGoals?: Record<string, unknown>) {
  const setValues = jest.fn();
  renderHook(useWindWakerMigration, {
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
const goals = { hearts: { collected: 12, total: 20 } };

describe('useWindWakerMigration', () => {
  describe('when the wind waker goal is in the other goals', () => {
    it('moves its goals into media and removes it from the other goals', () => {
      const setValues = runMigration({
        bikes,
        ww: { id: 'ww', name: 'Wind Waker', goals },
      });

      expect(setValues).toHaveBeenCalledWith({
        'media/wind_waker': goals,
        '2026/other_goals/ww': null,
      });
    });
  });

  describe('when the other goals have no wind waker goal', () => {
    it('leaves storage as it is', () => {
      const setValues = runMigration({ bikes });

      expect(setValues).not.toHaveBeenCalled();
    });
  });
});
