import { useEffect } from 'react';
import { useStorageContext } from '../../shared/FirebaseContext';
import { DAILY_PATH, EXERCISES_PATH, THIS_YEAR_PATH } from '../../shared/types';

type StoredItems = Record<string, unknown>;

export const LEGACY_DAILY_PATH = `${THIS_YEAR_PATH}/daily`;
export const LEGACY_EXERCISES_PATH = `${THIS_YEAR_PATH}/exercises`;

export function createMoveUpdates(
  from: string,
  to: string,
  legacyItems: StoredItems = {},
  currentItems: StoredItems = {},
): Record<string, unknown> {
  const ids = Object.keys(legacyItems);
  if (ids.length === 0) {
    return {};
  }

  const copies = ids
    .filter((id) => !(id in currentItems))
    .map((id) => [`${to}/${id}`, legacyItems[id]]);

  return { ...Object.fromEntries(copies), [from]: null };
}

export function useHealthDataMigration() {
  const { useValue, setValues } = useStorageContext();
  const { value: legacyDaily } = useValue<StoredItems>(LEGACY_DAILY_PATH);
  const { value: daily } = useValue<StoredItems>(DAILY_PATH);
  const { value: legacyExercises } = useValue<StoredItems>(
    LEGACY_EXERCISES_PATH,
  );
  const { value: exercises } = useValue<StoredItems>(EXERCISES_PATH);

  useEffect(() => {
    const updates = {
      ...createMoveUpdates(LEGACY_DAILY_PATH, DAILY_PATH, legacyDaily, daily),
      ...createMoveUpdates(
        LEGACY_EXERCISES_PATH,
        EXERCISES_PATH,
        legacyExercises,
        exercises,
      ),
    };

    if (Object.keys(updates).length > 0) {
      setValues(updates);
    }
  }, [legacyDaily, daily, legacyExercises, exercises, setValues]);
}
