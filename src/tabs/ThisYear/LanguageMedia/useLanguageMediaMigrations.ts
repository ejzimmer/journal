import { useEffect } from 'react';
import { useStorageContext } from '../../../shared/FirebaseContext';
import { createImportUpdateRekey } from './createImportUpdateRekey';
import { createProgressUpdateMigration } from './createProgressUpdateMigration';
import { createUpdateIdRemoval } from './createUpdateIdRemoval';
import { removeOverwrittenChanges } from './removeOverwrittenChanges';
import { LANGUAGE_MEDIA_PATH, StoredMediaByYear } from './types';

export function useLanguageMediaMigrations() {
  const { useValue, setValues } = useStorageContext();
  const { value: storedMediaByYear } =
    useValue<StoredMediaByYear>(LANGUAGE_MEDIA_PATH);

  useEffect(() => {
    const createId = () => crypto.randomUUID();
    const progressUpdates = createProgressUpdateMigration(
      storedMediaByYear,
      Temporal.Now.instant().toString(),
      createId,
    );
    const updates = {
      ...removeOverwrittenChanges(
        {
          ...createUpdateIdRemoval(storedMediaByYear),
          ...createImportUpdateRekey(storedMediaByYear, createId),
        },
        Object.keys(progressUpdates),
      ),
      ...progressUpdates,
    };
    if (Object.keys(updates).length > 0) {
      setValues(updates);
    }
  }, [storedMediaByYear, setValues]);
}
