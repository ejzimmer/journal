import { useStorageContext } from 'shared/FirebaseContext';
import { sortByPosition } from 'shared/drag-and-drop/utils';
import { SnapshotEntry, TODAY_SNAPSHOT_KEY } from '../../types';
import { findEntriesForToday } from './todayEntries';
import { useTodoLists } from './useTodoLists';

const pickTasks = <T extends { id: string }>(
  tasks: Record<string, T> | undefined,
  ids: Set<string>,
) => Object.values(tasks ?? {}).filter((task) => ids.has(task.id));

export function useTodayItems() {
  const { useValue } = useStorageContext();
  const { lists } = useTodoLists();
  const { value: snapshot } =
    useValue<Record<string, SnapshotEntry>>(TODAY_SNAPSHOT_KEY);

  const ids = new Set([
    ...Object.keys(snapshot ?? {}),
    ...findEntriesForToday(lists).map((entry) => entry.id),
  ]);

  return {
    daily: sortByPosition(pickTasks(lists.daily, ids)),
    weekly: sortByPosition(pickTasks(lists.weekly, ids)),
    calendar: pickTasks(lists.calendar, ids).toSorted((a, b) =>
      Temporal.PlainDate.compare(a.dueDate, b.dueDate),
    ),
  };
}
