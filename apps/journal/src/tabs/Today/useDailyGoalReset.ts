import { useStorageContext } from 'shared/FirebaseContext';
import { useDailyJob } from 'shared/dailyJobs/DailyJobsContext';
import { isSubtaskGoal, DAILY_GOALS_KEY } from 'shared/dailyGoals/types';
import { DAILY_GOALS_RESET_KEY, DailyGoalItem } from '../../types';
import { useGoalSubtaskStatuses } from './useGoalSubtaskStatuses';

export function useDailyGoalReset() {
  const { useValue, setValues } = useStorageContext();
  const { value: goals, synced: goalsSynced } =
    useValue<Record<string, DailyGoalItem>>(DAILY_GOALS_KEY);
  const goalList = Object.values(goals ?? {});
  const subtaskStatuses = useGoalSubtaskStatuses(
    goalList.filter(isSubtaskGoal),
  );

  useDailyJob({
    lastRunKey: DAILY_GOALS_RESET_KEY,
    isReady: goalsSynced && subtaskStatuses.synced,
    run: () => {
      const finishedGoals = goalList.filter(
        (goal) =>
          (isSubtaskGoal(goal)
            ? subtaskStatuses.findStatus(goal)
            : goal.status) !== 'ready',
      );
      if (finishedGoals.length === 0) return;

      setValues(
        Object.fromEntries(
          finishedGoals.map((goal) => [`${DAILY_GOALS_KEY}/${goal.id}`, null]),
        ),
      );
    },
  });
}
