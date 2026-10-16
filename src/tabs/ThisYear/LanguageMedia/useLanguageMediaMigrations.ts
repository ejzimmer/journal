import { useEffect } from 'react';
import { useStorageContext } from '../../../shared/FirebaseContext';
import { createImportUpdateRekey } from './createImportUpdateRekey';
import { createReadingsMigration } from './createReadingsMigration';
import { createUpdateIdRemoval } from './createUpdateIdRemoval';
import { LANGUAGE_MEDIA_PATH, StoredMediaByYear } from './types';

export function useLanguageMediaMigrations() {
  const { useValue, setValues } = useStorageContext();
  const { value: storedMediaByYear } =
    useValue<StoredMediaByYear>(LANGUAGE_MEDIA_PATH);

  useEffect(() => {
    const createId = () => crypto.randomUUID();
    const updates = {
      ...createUpdateIdRemoval(storedMediaByYear),
      ...createImportUpdateRekey(storedMediaByYear, createId),
      ...createReadingsMigration(
        storedMediaByYear,
        Temporal.Now.instant().toString(),
        createId,
      ),
    };
    if (Object.keys(updates).length > 0) {
      setValues(updates);
    }
  }, [storedMediaByYear, setValues]);
}
