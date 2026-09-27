import { renderHook } from '@testing-library/react';
import { ContextType } from '../../shared/FirebaseContext';
import { StorageContextWrapper } from '../../shared/storageContextTestUtils';
import { DAILY_PATH, EXERCISES_PATH } from '../../shared/types';
import {
  HealthStorageProvider,
  useHealthStorage,
} from './HealthStorageContext';

const createHealthStorage = (storage: Partial<ContextType> = {}) =>
  renderHook(useHealthStorage, {
    wrapper: ({ children }) => (
      <StorageContextWrapper value={storage}>
        <HealthStorageProvider>{children}</HealthStorageProvider>
      </StorageContextWrapper>
    ),
  }).result.current;

const storeValues =
  (values: Record<string, unknown>, loading = false): ContextType['useValue'] =>
  <T,>(key?: string) => ({
    value: key ? (values[key] as T) : undefined,
    loading,
  });

describe('HealthStorageContext', () => {
  it('throws when the hook is used outside a provider', () => {
    const errorSpy = jest.spyOn(console, 'error').mockImplementation();

    expect(() => renderHook(useHealthStorage)).toThrow(
      'missing HealthStorageContext provider',
    );

    errorSpy.mockRestore();
  });

  describe('calorie days', () => {
    const days = {
      '2026-01-06': { id: '2026-01-06', consumed: 1800, expended: 2200 },
    };

    it('reads the stored days', () => {
      const health = createHealthStorage({
        useValue: storeValues({ [DAILY_PATH]: days }),
      });

      expect(health.days).toEqual(days);
    });

    it('saves a day under its id', () => {
      const updateItem = jest.fn();
      const health = createHealthStorage({ updateItem });

      health.updateDay(days['2026-01-06']);

      expect(updateItem).toHaveBeenCalledWith(DAILY_PATH, days['2026-01-06']);
    });
  });

  describe('exercises', () => {
    const squat = { id: 'squat', name: 'Goblet squat' };

    it('lists the stored exercises', () => {
      const health = createHealthStorage({
        useValue: storeValues({ [EXERCISES_PATH]: { squat } }),
      });

      expect(health.exercises).toEqual([squat]);
    });

    it('adds an exercise by name', () => {
      const addItem = jest.fn();
      const health = createHealthStorage({ addItem });

      health.addExercise('Goblet squat');

      expect(addItem).toHaveBeenCalledWith(EXERCISES_PATH, {
        name: 'Goblet squat',
      });
    });

    it('records an update against the exercise', () => {
      const addItem = jest.fn();
      const health = createHealthStorage({ addItem });
      const update = {
        date: '2026-09-20',
        details: '3 x 10 x 10kg',
        recommendation: 'increase' as const,
      };

      health.recordExercise('squat', update);

      expect(addItem).toHaveBeenCalledWith(
        `${EXERCISES_PATH}/squat/updates`,
        update,
      );
    });
  });

  describe('while the stored data is loading', () => {
    it('says it is loading', () => {
      const health = createHealthStorage({
        useValue: storeValues({}, true),
      });

      expect(health.isLoading).toBe(true);
    });
  });
});
