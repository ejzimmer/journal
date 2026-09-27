import { renderHook } from '@testing-library/react';
import { ContextType } from '../../../shared/FirebaseContext';
import { StorageContextWrapper } from '../../../shared/storageContextTestUtils';
import {
  AdventureStorageProvider,
  useAdventureStorage,
} from './AdventureStorageContext';
import { Adventure, ADVENTURE_MODES_PATH, ADVENTURES_PATH } from './types';

const createAdventureStorage = (storage: Partial<ContextType> = {}) =>
  renderHook(useAdventureStorage, {
    wrapper: ({ children }) => (
      <StorageContextWrapper value={storage}>
        <AdventureStorageProvider>{children}</AdventureStorageProvider>
      </StorageContextWrapper>
    ),
  }).result.current;

const storeValues =
  (values: Record<string, unknown>, loading = false): ContextType['useValue'] =>
  <T,>(key?: string) => ({
    value: key ? (values[key] as T) : undefined,
    loading,
  });

const parkrun: Adventure = {
  id: 'parkrun',
  description: 'Plenty Gorge parkrun',
  modeId: 'running',
  isDone: false,
  plannedDate: '2026-10-03',
};

const newRunningMode = { name: 'Running', emoji: '🏃', colour: '#d11c2e' };
const running = { id: 'running', ...newRunningMode };

describe('AdventureStorageContext', () => {
  it('throws when the hook is used outside a provider', () => {
    const errorSpy = jest.spyOn(console, 'error').mockImplementation();

    expect(() => renderHook(useAdventureStorage)).toThrow(
      'missing AdventureStorageContext provider',
    );

    errorSpy.mockRestore();
  });

  describe('adventures', () => {
    it('lists the stored adventures', () => {
      const storage = createAdventureStorage({
        useValue: storeValues({ [ADVENTURES_PATH]: { parkrun } }),
      });

      expect(storage.adventures).toEqual([parkrun]);
    });

    describe('when there are none stored', () => {
      it('lists no adventures', () => {
        const storage = createAdventureStorage();

        expect(storage.adventures).toEqual([]);
      });
    });

    it('adds a new adventure as not done', () => {
      const addItem = jest.fn();
      const storage = createAdventureStorage({ addItem });

      storage.addAdventure({
        description: 'Plenty Gorge parkrun',
        modeId: 'running',
      });

      expect(addItem).toHaveBeenCalledWith(ADVENTURES_PATH, {
        description: 'Plenty Gorge parkrun',
        modeId: 'running',
        isDone: false,
      });
    });

    it('saves changes to an adventure', () => {
      const updateItem = jest.fn();
      const storage = createAdventureStorage({ updateItem });
      const changed = { ...parkrun, description: 'Westerfolds parkrun' };

      storage.updateAdventure(changed);

      expect(updateItem).toHaveBeenCalledWith(ADVENTURES_PATH, changed);
    });

    it('deletes an adventure', () => {
      const deleteItem = jest.fn();
      const storage = createAdventureStorage({ deleteItem });

      storage.deleteAdventure(parkrun);

      expect(deleteItem).toHaveBeenCalledWith(ADVENTURES_PATH, parkrun);
    });

    describe('planned date', () => {
      it('sets the planned date', () => {
        const setValue = jest.fn();
        const storage = createAdventureStorage({ setValue });

        storage.setPlannedDate(parkrun, '2026-10-10');

        expect(setValue).toHaveBeenCalledWith(
          `${ADVENTURES_PATH}/parkrun/plannedDate`,
          '2026-10-10',
        );
      });

      describe('when no date is given', () => {
        it('clears the planned date', () => {
          const setValue = jest.fn();
          const storage = createAdventureStorage({ setValue });

          storage.setPlannedDate(parkrun);

          expect(setValue).toHaveBeenCalledWith(
            `${ADVENTURES_PATH}/parkrun/plannedDate`,
            null,
          );
        });
      });
    });

    describe('status', () => {
      it('marks an adventure done', () => {
        const setValue = jest.fn();
        const storage = createAdventureStorage({ setValue });

        storage.markDone(parkrun);

        expect(setValue).toHaveBeenCalledWith(
          `${ADVENTURES_PATH}/parkrun/isDone`,
          true,
        );
      });

      it('marks an adventure not done', () => {
        const setValue = jest.fn();
        const storage = createAdventureStorage({ setValue });

        storage.markNotDone({ ...parkrun, isDone: true });

        expect(setValue).toHaveBeenCalledWith(
          `${ADVENTURES_PATH}/parkrun/isDone`,
          false,
        );
      });
    });
  });

  describe('modes', () => {
    it('lists the stored modes', () => {
      const storage = createAdventureStorage({
        useValue: storeValues({ [ADVENTURE_MODES_PATH]: { running } }),
      });

      expect(storage.modes).toEqual([running]);
    });

    it('adds a mode and returns its id', () => {
      const addItem = jest.fn().mockReturnValue('running');
      const storage = createAdventureStorage({ addItem });

      const id = storage.addMode(newRunningMode);

      expect(addItem).toHaveBeenCalledWith(
        ADVENTURE_MODES_PATH,
        newRunningMode,
      );
      expect(id).toBe('running');
    });
  });

  describe('while the stored data is loading', () => {
    it('says it is loading', () => {
      const storage = createAdventureStorage({
        useValue: storeValues({}, true),
      });

      expect(storage.isLoading).toBe(true);
    });
  });
});
