import { useEffect } from 'react';
import { useStorageContext } from 'shared/FirebaseContext';
import { useDailyJob } from 'shared/dailyJobs/DailyJobsContext';
import {
  SnapshotEntry,
  TODAY_SNAPSHOT_KEY,
  TODAY_SNAPSHOT_RESET_KEY,
} from '../../types';
import { findEntriesForToday, indexEntriesById } from './todayEntries';
import { useTodoLists } from './useTodoLists';

export function useTodaySnapshot() {
  const { useValue, setValue, setValues } = useStorageContext();
  const { lists, synced: listsSynced } = useTodoLists();
  const { value: snapshot, synced: snapshotSynced } =
    useValue<Record<string, SnapshotEntry>>(TODAY_SNAPSHOT_KEY);
  const synced = listsSynced && snapshotSynced;

  useDailyJob({
    lastRunKey: TODAY_SNAPSHOT_RESET_KEY,
    isReady: synced,
    run: () =>
      setValue(
        TODAY_SNAPSHOT_KEY,
        indexEntriesById(findEntriesForToday(lists)),
      ),
  });

  useEffect(() => {
    if (!synced) return;

    const newEntries = findEntriesForToday(lists).filter(
      (entry) => !snapshot?.[entry.id],
    );
    if (newEntries.length === 0) return;

    setValues(
      Object.fromEntries(
        newEntries.map((entry) => [`${TODAY_SNAPSHOT_KEY}/${entry.id}`, entry]),
      ),
    );
  }, [lists, snapshot, synced, setValues]);
}
