import { getToday } from 'shared/dates';
import { useStorageContext } from 'shared/FirebaseContext';
import { useDailyJob } from 'shared/dailyJobs/DailyJobsContext';
import { sortByPosition } from 'shared/drag-and-drop/utils';
import { DAILY_KEY, DAILY_RESET_KEY, DailyTask } from '../../../types';

const readyForToday = (task: DailyTask) =>
  task.status === 'done'
    ? {
        ...task,
        status: 'ready' as const,
        lastCompleted: getToday(),
      }
    : task;

export function useDailyReset() {
  const { useValue, updateList } = useStorageContext();
  const { value: tasksById, synced } =
    useValue<Record<string, DailyTask>>(DAILY_KEY);

  useDailyJob({
    lastRunKey: DAILY_RESET_KEY,
    isReady: synced && tasksById !== undefined,
    run: () => {
      const tasks = sortByPosition(Object.values(tasksById ?? {}));
      updateList(DAILY_KEY, tasks.map(readyForToday));
    },
  });
}
