import { useEffect, useMemo, useRef } from 'react';
import { useStorageContext } from '../../../shared/FirebaseContext';
import { KEY, Yarn } from './types';
import { hasTwoDigitYearMonths, migrateYarnDates } from './migrateYarnDates';

export function useYarn() {
  const { useValue, setValue } = useStorageContext();
  const { value } = useValue<Yarn>(KEY);
  const yarn = useMemo(() => value && migrateYarnDates(value), [value]);

  const hasMigrated = useRef(false);
  useEffect(() => {
    if (!value || !yarn || hasMigrated.current) return;
    hasMigrated.current = true;

    if (hasTwoDigitYearMonths(value)) {
      setValue(KEY, yarn);
    }
  }, [value, yarn, setValue]);

  return yarn;
}
