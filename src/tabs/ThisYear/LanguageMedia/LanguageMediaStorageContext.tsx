import { createContext, ReactNode, useContext, useMemo, useState } from 'react';
import { useStorageContext } from '../../../shared/FirebaseContext';
import { getThisYear } from '../../../shared/dates';
import { createMedia } from './createMedia';
import {
  getLanguageMediaPath,
  LANGUAGE_MEDIA_PATH,
  LanguageMedia,
  NewMedia,
  StoredMediaByYear,
} from './types';

export type LanguageMediaYearStorage = {
  year: number;
  media: LanguageMedia[];

  addMedia: (media: NewMedia) => void;
  updateMedia: (media: LanguageMedia) => void;
  deleteMedia: (media: LanguageMedia) => void;
};

export type LanguageMediaStorageContextType = {
  years: number[];
  thisYear: number;
  selectedYear: number;
  isLoading: boolean;
  selectYear: (year: number) => void;
  getMediaYear: (year: number) => LanguageMediaYearStorage;
};

export const LanguageMediaStorageContext = createContext<
  LanguageMediaStorageContextType | undefined
>(undefined);

const removeUndefinedValues = <T,>(value: T): T =>
  JSON.parse(JSON.stringify(value));

const listYearsNewestFirst = (
  thisYear: number,
  storedMediaByYear?: StoredMediaByYear,
) =>
  [
    ...new Set([thisYear, ...Object.keys(storedMediaByYear ?? {}).map(Number)]),
  ].sort((a, b) => b - a);

export function LanguageMediaStorageProvider({
  children,
}: {
  children: ReactNode;
}) {
  const { addItem, updateItem, deleteItem, useValue } = useStorageContext();
  const { value: storedMediaByYear, loading } =
    useValue<StoredMediaByYear>(LANGUAGE_MEDIA_PATH);
  const thisYear = getThisYear();
  const [selectedYear, selectYear] = useState(thisYear);

  const mediaYears = useMemo(() => {
    const createMediaYear = (year: number): LanguageMediaYearStorage => {
      const path = getLanguageMediaPath(year);

      return {
        year,
        media: Object.values(storedMediaByYear?.[year] ?? {}),
        addMedia: (newMedia) => {
          addItem<LanguageMedia>(path, createMedia(newMedia));
        },
        updateMedia: (changed) =>
          updateItem<LanguageMedia>(path, removeUndefinedValues(changed)),
        deleteMedia: (deleted) => deleteItem<LanguageMedia>(path, deleted),
      };
    };

    const years = listYearsNewestFirst(thisYear, storedMediaByYear);
    const mediaByYear = new Map(
      years.map((year) => [year, createMediaYear(year)]),
    );

    return {
      years,
      getMediaYear: (year: number) =>
        mediaByYear.get(year) ?? createMediaYear(year),
    };
  }, [thisYear, storedMediaByYear, addItem, updateItem, deleteItem]);

  const value = useMemo(
    () => ({
      ...mediaYears,
      thisYear,
      selectedYear,
      selectYear,
      isLoading: loading,
    }),
    [mediaYears, thisYear, selectedYear, loading],
  );

  return (
    <LanguageMediaStorageContext.Provider value={value}>
      {children}
    </LanguageMediaStorageContext.Provider>
  );
}

export function useLanguageMediaStorageContext(): LanguageMediaStorageContextType {
  const context = useContext(LanguageMediaStorageContext);
  if (!context) {
    throw new Error('missing LanguageMediaStorageContext provider');
  }
  return context;
}

export function useLanguageMediaStorage(): LanguageMediaYearStorage {
  const { getMediaYear, selectedYear } = useLanguageMediaStorageContext();
  return getMediaYear(selectedYear);
}
