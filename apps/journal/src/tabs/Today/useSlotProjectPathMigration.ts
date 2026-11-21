import { useEffect } from 'react';
import { useStorageContext } from 'shared/FirebaseContext';
import { TODAY_SLOTS_KEY } from 'shared/todaySlots/types';
import { TodaySlot } from '../../types';
import { createSlotProjectPathUpdates } from './slotProjectPathMigration';

export function useSlotProjectPathMigration() {
  const { useValue, setValues } = useStorageContext();
  const { value: slots, synced } =
    useValue<Record<string, TodaySlot>>(TODAY_SLOTS_KEY);

  useEffect(() => {
    if (!synced) return;

    const updates = createSlotProjectPathUpdates(slots);
    if (Object.keys(updates).length > 0) setValues(updates);
  }, [slots, synced, setValues]);
}
