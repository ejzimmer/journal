import { useEffect } from 'react';
import { useStorageContext } from '../../../shared/FirebaseContext';
import { StoredYarn, StoredYarnByYear, getYarnPath } from './types';

const LEGACY_YEAR = 2026;
const LEGACY_PATH = `${LEGACY_YEAR}/yarn`;

export function useYarnPathMigration(storedYarnByYear?: StoredYarnByYear) {
  const { useValue, setValues } = useStorageContext();
  const { value: legacyYarn } = useValue<StoredYarn>(LEGACY_PATH);
  const hasMigratedYarn = Boolean(storedYarnByYear?.[LEGACY_YEAR]);

  useEffect(() => {
    if (!legacyYarn || hasMigratedYarn) return;

    setValues({
      [getYarnPath(LEGACY_YEAR)]: legacyYarn,
      [LEGACY_PATH]: null,
    });
  }, [legacyYarn, hasMigratedYarn, setValues]);
}
