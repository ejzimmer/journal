import { useEffect } from 'react';
import { useStorageContext } from 'shared/FirebaseContext';
import { getNextPosition, sortByPosition } from 'shared/drag-and-drop/utils';
import { DAILY_KEY, DailyTask, ONCE_KEY } from '../../../types';

// One-off tasks used to share the daily list, so data written before the
// lists were split still has 一度 tasks under DAILY_KEY.
export function useOnceListMigration() {
  const { useValue, setValues } = useStorageContext();
  const { value: dailyTasks, synced: dailySynced } =
    useValue<Record<string, DailyTask>>(DAILY_KEY);
  const { value: onceTasks, synced: onceSynced } =
    useValue<Record<string, DailyTask>>(ONCE_KEY);

  useEffect(() => {
    if (!dailySynced || !onceSynced) return;

    const tasksToMove = sortByPosition(
      Object.values(dailyTasks ?? {}).filter((task) => task.type === '一度'),
    );
    if (tasksToMove.length === 0) return;

    const firstPosition = getNextPosition(Object.values(onceTasks ?? {}));
    const updates = Object.fromEntries(
      tasksToMove.flatMap((task, index) => [
        [
          `${ONCE_KEY}/${task.id}`,
          { ...task, position: firstPosition + index },
        ],
        [`${DAILY_KEY}/${task.id}`, null],
      ]),
    );
    setValues(updates);
  }, [dailyTasks, onceTasks, dailySynced, onceSynced, setValues]);
}
