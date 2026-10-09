import { createContext, ReactNode, useContext, useMemo } from 'react';
import { useStorageContext } from '../../../shared/FirebaseContext';
import {
  Adventure,
  ADVENTURE_MODES_PATH,
  AdventureMode,
  ADVENTURES_PATH,
} from './types';
import { updateCompletionDate } from '../../../shared/years';

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

type Positioned = { id: string; position?: number };

const sortByPosition = <T extends Positioned>(items: Record<string, T> = {}) =>
  Object.values(items).toSorted(
    (a, b) =>
      (a.position ?? -1) - (b.position ?? -1) || a.id.localeCompare(b.id),
  );

const getNextPosition = (items: Positioned[]) =>
  Math.max(-1, ...items.map(({ position }) => position ?? -1)) + 1;

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
    () => sortByPosition(storedAdventures),
    [storedAdventures],
  );
  const modes = useMemo(() => sortByPosition(storedModes), [storedModes]);

  const value: AdventureStorageContextType = {
    adventures,
    modes,
    isLoading: adventuresLoading || modesLoading,

    addAdventure: ({ description, modeId }) => {
      addItem<Adventure>(ADVENTURES_PATH, {
        description,
        modeId,
        isDone: false,
        position: getNextPosition(adventures),
      });
    },
    updateAdventure: (adventure) =>
      updateItem<Adventure>(
        ADVENTURES_PATH,
        updateCompletionDate(
          removeClearedPlannedDate(adventure),
          adventure.isDone,
        ),
      ),
    deleteAdventure: (adventure) =>
      deleteItem<Adventure>(ADVENTURES_PATH, adventure),

    addMode: (mode) =>
      addItem<AdventureMode>(ADVENTURE_MODES_PATH, {
        ...mode,
        position: getNextPosition(modes),
      }),
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
