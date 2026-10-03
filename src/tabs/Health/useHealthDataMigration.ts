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
  const legacyDaily = useValue<StoredItems>(LEGACY_DAILY_PATH);
  const daily = useValue<StoredItems>(DAILY_PATH);
  const legacyExercises = useValue<StoredItems>(LEGACY_EXERCISES_PATH);
  const exercises = useValue<StoredItems>(EXERCISES_PATH);
  const synced = [legacyDaily, daily, legacyExercises, exercises].every(
    (result) => result.synced,
  );

  useEffect(() => {
    if (!synced) return;

    const updates = {
      ...createMoveUpdates(
        LEGACY_DAILY_PATH,
        DAILY_PATH,
        legacyDaily.value,
        daily.value,
      ),
      ...createMoveUpdates(
        LEGACY_EXERCISES_PATH,
        EXERCISES_PATH,
        legacyExercises.value,
        exercises.value,
      ),
    };

    if (Object.keys(updates).length > 0) {
      setValues(updates);
    }
  }, [
    synced,
    legacyDaily.value,
    daily.value,
    legacyExercises.value,
    exercises.value,
    setValues,
  ]);
}
