import { isBeforeToday } from '../../../shared/dates';
import { useStorageContext } from '../../../shared/FirebaseContext';
import { useDailyJob } from '../../../shared/dailyJobs/DailyJobsContext';
import {
  renumberPositions,
  sortByPosition,
} from '../../../shared/drag-and-drop/utils';
import { DAILY_KEY, DAILY_RESET_KEY, DailyTask } from '../../../shared/types';

const finishedBeforeToday = (task: DailyTask) =>
  task.status === 'finished' && isBeforeToday(task.lastCompleted);

const readyForToday = (task: DailyTask) =>
  task.status === 'done'
    ? { ...task, status: 'ready' as const, lastCompleted: new Date().getTime() }
    : task;

export function useDailyReset() {
  const { useValue, updateList } = useStorageContext();
  const { value: tasksById } = useValue<Record<string, DailyTask>>(DAILY_KEY);

  useDailyJob({
    lastRunKey: DAILY_RESET_KEY,
    isReady: tasksById !== undefined,
    run: () => {
      const tasks = sortByPosition(Object.values(tasksById ?? {}));
      const remainingTasks = renumberPositions(
        tasks.filter((task) => !finishedBeforeToday(task)).map(readyForToday),
      );

      updateList(DAILY_KEY, remainingTasks);
    },
  });
}
