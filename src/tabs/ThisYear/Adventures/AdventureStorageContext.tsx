import { createContext, ReactNode, useContext, useMemo } from 'react';
import { useStorageContext } from '../../../shared/FirebaseContext';
import {
  Adventure,
  ADVENTURE_MODES_PATH,
  AdventureMode,
  ADVENTURES_PATH,
} from './types';
import { stampCompletion } from '../../../shared/years';

export type AdventureStorageContextType = {
  adventures: Adventure[];
  modes: AdventureMode[];
  isLoading: boolean;

  addAdventure: (adventure: Pick<Adventure, 'description' | 'modeId'>) => void;
  updateAdventure: (adventure: Adventure) => void;
  deleteAdventure: (adventure: Adventure) => void;

  addMode: (mode: Omit<AdventureMode, 'id'>) => string | null;
};

export const AdventureStorageContext = createContext<
  AdventureStorageContextType | undefined
>(undefined);

const removeClearedPlannedDate = ({ plannedDate, ...adventure }: Adventure) =>
  plannedDate ? { ...adventure, plannedDate } : adventure;

export function AdventureStorageProvider({
  children,
}: {
  children: ReactNode;
}) {
  const { addItem, updateItem, deleteItem, useValue } = useStorageContext();

  const { value: storedAdventures, loading: adventuresLoading } =
    useValue<Record<string, Adventure>>(ADVENTURES_PATH);
  const { value: storedModes, loading: modesLoading } =
    useValue<Record<string, AdventureMode>>(ADVENTURE_MODES_PATH);

  const adventures = useMemo(
    () => Object.values(storedAdventures ?? {}),
    [storedAdventures],
  );
  const modes = useMemo(() => Object.values(storedModes ?? {}), [storedModes]);

  const value: AdventureStorageContextType = {
    adventures,
    modes,
    isLoading: adventuresLoading || modesLoading,

    addAdventure: ({ description, modeId }) => {
      addItem<Adventure>(ADVENTURES_PATH, {
        description,
        modeId,
        isDone: false,
      });
    },
    updateAdventure: (adventure) =>
      updateItem<Adventure>(
        ADVENTURES_PATH,
        stampCompletion(removeClearedPlannedDate(adventure), adventure.isDone),
      ),
    deleteAdventure: (adventure) =>
      deleteItem<Adventure>(ADVENTURES_PATH, adventure),

    addMode: (mode) => addItem<AdventureMode>(ADVENTURE_MODES_PATH, mode),
  };

  return (
    <AdventureStorageContext.Provider value={value}>
      {children}
    </AdventureStorageContext.Provider>
  );
}

export function useAdventureStorage(): AdventureStorageContextType {
  const context = useContext(AdventureStorageContext);
  if (!context) {
    throw new Error('missing AdventureStorageContext provider');
  }
  return context;
}
