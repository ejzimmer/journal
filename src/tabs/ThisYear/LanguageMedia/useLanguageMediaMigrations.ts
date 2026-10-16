import { useEffect } from 'react';
import { useStorageContext } from '../../../shared/FirebaseContext';
import { createImportUpdateRekey } from './createImportUpdateRekey';
import { createProgressUpdateMigration } from './createProgressUpdateMigration';
import { createUpdateIdRemoval } from './createUpdateIdRemoval';
import { omitPrintSeries } from './omitPrintSeries';
import { LANGUAGE_MEDIA_PATH, StoredMediaByYear } from './types';

export function useLanguageMediaMigrations() {
  const { useValue, setValues } = useStorageContext();
  const { value: storedMediaByYear } =
    useValue<StoredMediaByYear>(LANGUAGE_MEDIA_PATH);

  useEffect(() => {
    const createId = () => crypto.randomUUID();
    const otherMedia = omitPrintSeries(storedMediaByYear);
    const updates = {
      ...createUpdateIdRemoval(otherMedia),
      ...createImportUpdateRekey(otherMedia, createId),
      ...createProgressUpdateMigration(
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
