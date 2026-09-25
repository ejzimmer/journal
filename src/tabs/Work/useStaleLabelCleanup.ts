import { useStorageContext } from '../../shared/FirebaseContext';
import { useDailyJob } from '../../shared/dailyJobs/DailyJobsContext';
import { LABELS_CLEANUP_KEY, LABELS_KEY, StoredLabel } from './types';

const STALE_AFTER_MS = 7 * 24 * 60 * 60 * 1000;

const isStale = (label: StoredLabel) =>
  label.lastRemoved !== undefined &&
  label.lastRemoved < Date.now() - STALE_AFTER_MS;

export function useStaleLabelCleanup() {
  const { useValue, deleteItem } = useStorageContext();
  const { value: labelsById, loading } =
    useValue<Record<string, StoredLabel>>(LABELS_KEY);

  useDailyJob({
    lastRunKey: LABELS_CLEANUP_KEY,
    isReady: !loading,
    run: () => {
      Object.values(labelsById ?? {})
        .filter(isStale)
        .forEach((label) => deleteItem(LABELS_KEY, label));
    },
  });
}
