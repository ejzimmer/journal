import { getDaysSince } from '../../../shared/dates';
import { useStorageContext } from '../../../shared/FirebaseContext';
import { useDailyJob } from '../../../shared/dailyJobs/DailyJobsContext';
import {
  WEEKLY_KEY,
  WEEKLY_RESET_KEY,
  WeeklyTask,
} from '../../../shared/types';

export function refreshTasks(
  tasks: WeeklyTask[],
  updateTask: (task: WeeklyTask) => void,
) {
  tasks.forEach((task) => {
    if (!task.completed) return;

    const updatedCompleted = task.completed.filter(
      (date) => getDaysSince(date) < 7,
    );
    if (updatedCompleted.length !== task.completed.length) {
      updateTask({ ...task, completed: updatedCompleted });
    }
  });
}

export function useWeeklyReset() {
  const { useValue, updateItem } = useStorageContext();
  const { value: tasksById } = useValue<Record<string, WeeklyTask>>(WEEKLY_KEY);

  useDailyJob({
    lastRunKey: WEEKLY_RESET_KEY,
    isReady: tasksById !== undefined,
    run: () =>
      refreshTasks(Object.values(tasksById ?? {}), (task) =>
        updateItem<WeeklyTask>(WEEKLY_KEY, task),
      ),
  });
}
