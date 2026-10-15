import { useEffect } from 'react';
import { useStorageContext } from '../../../shared/FirebaseContext';
import { createReadingsMigration } from './createReadingsMigration';
import { LANGUAGE_MEDIA_PATH, StoredMediaByYear } from './types';

export function useReadingsMigration() {
  const { useValue, setValues } = useStorageContext();
  const { value: storedMediaByYear } =
    useValue<StoredMediaByYear>(LANGUAGE_MEDIA_PATH);

  useEffect(() => {
    const updates = createReadingsMigration(
      storedMediaByYear,
      Temporal.Now.instant().toString(),
    );
    if (Object.keys(updates).length > 0) {
      setValues(updates);
    }
  }, [storedMediaByYear, setValues]);
}
