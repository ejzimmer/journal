import { useEffect } from 'react';
import { useStorageContext } from 'shared/FirebaseContext';
import { DAILY_PATH, DayData } from '../../../types';
import { createLegacyTrackerUpdates } from './legacyTrackerMigration';

export function useLegacyTrackerMigration() {
  const { useValue, setValues } = useStorageContext();
  const { value: days, synced } = useValue<Record<string, DayData>>(DAILY_PATH);

  useEffect(() => {
    if (!synced) return;

    const updates = createLegacyTrackerUpdates(days);
    if (Object.keys(updates).length > 0) setValues(updates);
  }, [days, synced, setValues]);
}
