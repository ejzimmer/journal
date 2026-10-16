import { useEffect } from 'react';
import { useStorageContext } from '../../../shared/FirebaseContext';
import { createReadingsMigration } from './createReadingsMigration';
import { createUpdateIdRemoval } from './createUpdateIdRemoval';
import { LANGUAGE_MEDIA_PATH, StoredMediaByYear } from './types';

export function useLanguageMediaMigrations() {
  const { useValue, setValues } = useStorageContext();
  const { value: storedMediaByYear } =
    useValue<StoredMediaByYear>(LANGUAGE_MEDIA_PATH);

  useEffect(() => {
    const updates = {
      ...createUpdateIdRemoval(storedMediaByYear),
      ...createReadingsMigration(
        storedMediaByYear,
        Temporal.Now.instant().toString(),
      ),
    };
    if (Object.keys(updates).length > 0) {
      setValues(updates);
    }
  }, [storedMediaByYear, setValues]);
}
