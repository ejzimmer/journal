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
    it('reads them from the adventures path', () => {
      const useValue = jest
        .fn()
        .mockReturnValue({ value: undefined, loading: false, synced: true });

      createAdventureStorage({ useValue });

      expect(useValue).toHaveBeenCalledWith(ADVENTURES_PATH);
    });

    it('lists the stored adventures', () => {
      const storage = createAdventureStorage({
        useValue: <T,>() => ({
          value: { parkrun } as T,
          loading: false,
          synced: true,
        }),
      });

      expect(storage.adventures).toEqual([parkrun]);
    });

    it('lists them in the order they were added', () => {
      const first = { ...parkrun, id: 'b', position: 0 };
      const second = { ...parkrun, id: 'a', position: 1 };
      const storage = createAdventureStorage({
        useValue: <T,>() => ({
          value: { a: second, b: first } as T,
          loading: false,
          synced: true,
        }),
      });

      expect(storage.adventures).toEqual([first, second]);
    });

    describe('when some were added before they had a position', () => {
      it('lists those first', () => {
        const positioned = { ...parkrun, id: 'a', position: 0 };
        const unpositioned = { ...parkrun, id: 'b' };
        const storage = createAdventureStorage({
          useValue: <T,>() => ({
            value: { a: positioned, b: unpositioned } as T,
            loading: false,
            synced: true,
          }),
        });

        expect(storage.adventures).toEqual([unpositioned, positioned]);
      });
    });

    describe('when there are none stored', () => {
      it('lists no adventures', () => {
        const storage = createAdventureStorage();

        expect(storage.adventures).toEqual([]);
      });
    });

    describe('adding an adventure', () => {
      it('adds it as not done', () => {
        const addItem = jest.fn();
        const storage = createAdventureStorage({ addItem });

        storage.addAdventure({
          description: 'Plenty Gorge parkrun',
          modeId: 'running',
        });

        expect(addItem).toHaveBeenCalledWith(
          ADVENTURES_PATH,
          expect.objectContaining({
            description: 'Plenty Gorge parkrun',
            modeId: 'running',
            isDone: false,
          }),
        );
      });

      describe('when there are none stored', () => {
        it('puts it first', () => {
          const addItem = jest.fn();
          const storage = createAdventureStorage({ addItem });

          storage.addAdventure({ description: 'Parkrun', modeId: 'running' });

          expect(addItem.mock.calls[0][1].position).toBe(0);
        });
      });

      describe('when there are some stored', () => {
        it('puts it after the last one', () => {
          const addItem = jest.fn();
          const storage = createAdventureStorage({
            addItem,
            useValue: <T,>() => ({
              value: {
                a: { ...parkrun, id: 'a', position: 3 },
                b: { ...parkrun, id: 'b' },
              } as T,
              loading: false,
              synced: true,
            }),
          });

          storage.addAdventure({ description: 'Parkrun', modeId: 'running' });

          expect(addItem.mock.calls[0][1].position).toBe(4);
        });
      });
    });

    describe('updating an adventure', () => {
      it('saves the changes', () => {
        const updateItem = jest.fn();
        const storage = createAdventureStorage({ updateItem });
        const changed = { ...parkrun, description: 'Westerfolds parkrun' };

        storage.updateAdventure(changed);

        expect(updateItem).toHaveBeenCalledWith(ADVENTURES_PATH, changed);
      });

      describe('when the planned date has been cleared', () => {
        it('saves the adventure without a planned date', () => {
          const updateItem = jest.fn();
          const storage = createAdventureStorage({ updateItem });

          storage.updateAdventure({ ...parkrun, plannedDate: undefined });

          expect(updateItem.mock.calls[0][1]).toStrictEqual({
            id: 'parkrun',
            description: 'Plenty Gorge parkrun',
            modeId: 'running',
            isDone: false,
          });
        });
      });
    });

    it('deletes an adventure', () => {
      const deleteItem = jest.fn();
      const storage = createAdventureStorage({ deleteItem });

      storage.deleteAdventure(parkrun);

      expect(deleteItem).toHaveBeenCalledWith(ADVENTURES_PATH, parkrun);
    });
  });

  describe('modes', () => {
    it('reads them from the modes path', () => {
      const useValue = jest
        .fn()
        .mockReturnValue({ value: undefined, loading: false, synced: true });

      createAdventureStorage({ useValue });

      expect(useValue).toHaveBeenCalledWith(ADVENTURE_MODES_PATH);
    });

    it('lists the stored modes', () => {
      const storage = createAdventureStorage({
        useValue: <T,>() => ({
          value: { running } as T,
          loading: false,
          synced: true,
        }),
      });

      expect(storage.modes).toEqual([running]);
    });

    it('lists them in the order they were added', () => {
      const first = { ...running, id: 'b', position: 0 };
      const second = { ...running, id: 'a', position: 1 };
      const storage = createAdventureStorage({
        useValue: <T,>() => ({
          value: { a: second, b: first } as T,
          loading: false,
          synced: true,
        }),
      });

      expect(storage.modes).toEqual([first, second]);
    });

    describe('adding a mode', () => {
      it('saves it after the last one', () => {
        const addItem = jest.fn();
        const storage = createAdventureStorage({
          addItem,
          useValue: <T,>() => ({
            value: { running: { ...running, position: 1 } } as T,
            loading: false,
            synced: true,
          }),
        });

        storage.addMode(newRunningMode);

        expect(addItem).toHaveBeenCalledWith(ADVENTURE_MODES_PATH, {
          ...newRunningMode,
          position: 2,
        });
      });

      it('returns its id', () => {
        const addItem = jest.fn().mockReturnValue('running');
        const storage = createAdventureStorage({ addItem });

        expect(storage.addMode(newRunningMode)).toBe('running');
      });
    });
  });

  describe('while the stored data is loading', () => {
    it('says it is loading', () => {
      const storage = createAdventureStorage({
        useValue: () => ({ value: undefined, loading: true, synced: false }),
      });

      expect(storage.isLoading).toBe(true);
    });
  });
});
