import { createContext, ReactNode, useContext, useMemo } from 'react';
import { useStorageContext } from '../../../shared/FirebaseContext';
import { createMedia } from './createMedia';
import { LANGUAGE_MEDIA_PATH, LanguageMedia, NewMedia } from './types';

export type LanguageMediaStorageContextType = {
  media: LanguageMedia[];
  isLoading: boolean;

  addMedia: (media: NewMedia) => void;
  updateMedia: (media: LanguageMedia) => void;
  deleteMedia: (media: LanguageMedia) => void;
};

export const LanguageMediaStorageContext = createContext<
  LanguageMediaStorageContextType | undefined
>(undefined);

const removeUndefinedValues = <T,>(value: T): T =>
  JSON.parse(JSON.stringify(value));

export function LanguageMediaStorageProvider({
  children,
}: {
  children: ReactNode;
}) {
  const { addItem, updateItem, deleteItem, useValue } = useStorageContext();

  const { value: storedMedia, loading } =
    useValue<Record<string, LanguageMedia>>(LANGUAGE_MEDIA_PATH);

  const media = useMemo(() => Object.values(storedMedia ?? {}), [storedMedia]);

  const value: LanguageMediaStorageContextType = {
    media,
    isLoading: loading,

    addMedia: (newMedia) => {
      addItem<LanguageMedia>(LANGUAGE_MEDIA_PATH, createMedia(newMedia));
    },
    updateMedia: (changed) =>
      updateItem<LanguageMedia>(
        LANGUAGE_MEDIA_PATH,
        removeUndefinedValues(changed),
      ),
    deleteMedia: (deleted) =>
      deleteItem<LanguageMedia>(LANGUAGE_MEDIA_PATH, deleted),
  };

  return (
    <LanguageMediaStorageContext.Provider value={value}>
      {children}
    </LanguageMediaStorageContext.Provider>
  );
}

export function useLanguageMediaStorage(): LanguageMediaStorageContextType {
  const context = useContext(LanguageMediaStorageContext);
  if (!context) {
    throw new Error('missing LanguageMediaStorageContext provider');
  }
  return context;
}
