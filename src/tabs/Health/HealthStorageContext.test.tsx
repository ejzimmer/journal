import { renderHook } from '@testing-library/react';
import { ContextType } from '../../shared/FirebaseContext';
import { StorageContextWrapper } from '../../shared/storageContextTestUtils';
import { CLASSES_PATH, DAILY_PATH, EXERCISES_PATH } from '../../shared/types';
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
    synced: !loading,
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

    describe('with exercises stored out of order', () => {
      const plank = { id: 'a-plank', name: 'Plank', position: 1 };
      const deadlift = { id: 'b-deadlift', name: 'Deadlift', position: 0 };
      const lunge = { id: 'c-lunge', name: 'Lunge' };
      const useValue = storeValues({
        [EXERCISES_PATH]: { plank, deadlift, lunge },
      });

      it('lists unpositioned exercises first, then the rest by position', () => {
        const health = createHealthStorage({ useValue });

        expect(health.exercises).toEqual([lunge, deadlift, plank]);
      });

      it('adds a new exercise after the last position', () => {
        const addItem = jest.fn();
        const health = createHealthStorage({ addItem, useValue });

        health.addExercise('Goblet squat');

        expect(addItem).toHaveBeenCalledWith(EXERCISES_PATH, {
          name: 'Goblet squat',
          position: 2,
        });
      });
    });

    describe('with no exercises stored', () => {
      it('adds an exercise at the first position', () => {
        const addItem = jest.fn();
        const health = createHealthStorage({ addItem });

        health.addExercise('Goblet squat');

        expect(addItem).toHaveBeenCalledWith(EXERCISES_PATH, {
          name: 'Goblet squat',
          position: 0,
        });
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

    describe('with an update already recorded', () => {
      const update = {
        id: 'update-1',
        date: '2026-09-20',
        details: '3 x 10 x 10kg',
      };

      it('replaces the update with an edited one', () => {
        const updateItem = jest.fn();
        const health = createHealthStorage({ updateItem });
        const edited = {
          ...update,
          details: '3 x 10 x 12kg',
          recommendation: 'increase' as const,
        };

        health.editExerciseUpdate('squat', edited);

        expect(updateItem).toHaveBeenCalledWith(
          `${EXERCISES_PATH}/squat/updates`,
          edited,
        );
      });

      it('deletes the update', () => {
        const deleteItem = jest.fn();
        const health = createHealthStorage({ deleteItem });

        health.deleteExerciseUpdate('squat', update);

        expect(deleteItem).toHaveBeenCalledWith(
          `${EXERCISES_PATH}/squat/updates`,
          update,
        );
      });
    });
  });

  describe('classes', () => {
    it('adds a class', () => {
      const addItem = jest.fn();
      const health = createHealthStorage({ addItem });
      const wheel = {
        description: 'Wheel',
        blocks: [{ id: 'all', total: 30 }],
      };

      health.addClass(wheel);

      expect(addItem).toHaveBeenCalledWith(CLASSES_PATH, wheel);
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
