import { isBeforeToday } from 'shared/dates';
import { useStorageContext } from 'shared/FirebaseContext';
import { useDailyJob } from 'shared/dailyJobs/DailyJobsContext';
import { renumberPositions, sortByPosition } from 'shared/drag-and-drop/utils';
import { ONCE_KEY, ONCE_RESET_KEY, DailyTask } from '../../../types';

export const isFinishedBeforeToday = (task: DailyTask) =>
  task.status === 'finished' && isBeforeToday(task.lastCompleted);

export function useOnceReset() {
  const { useValue, updateList } = useStorageContext();
  const { value: tasksById, synced } =
    useValue<Record<string, DailyTask>>(ONCE_KEY);

  useDailyJob({
    lastRunKey: ONCE_RESET_KEY,
    isReady: synced && tasksById !== undefined,
    run: () => {
      const tasks = sortByPosition(Object.values(tasksById ?? {}));
      updateList(
        ONCE_KEY,
        renumberPositions(tasks.filter((task) => !isFinishedBeforeToday(task))),
      );
    },
  });
}
