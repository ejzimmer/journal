import { useStorageContext } from 'shared/FirebaseContext';
import { useDailyJob } from 'shared/dailyJobs/DailyJobsContext';
import { isLinkedGoal, DAILY_GOALS_KEY } from 'shared/dailyGoals/types';
import { DAILY_GOALS_RESET_KEY, DailyGoalItem } from '../../types';
import { useLinkedGoalStatuses } from './useLinkedGoalStatuses';

export function useDailyGoalReset() {
  const { useValue, setValues } = useStorageContext();
  const { value: goals, synced: goalsSynced } =
    useValue<Record<string, DailyGoalItem>>(DAILY_GOALS_KEY);
  const goalList = Object.values(goals ?? {});
  const linkedStatuses = useLinkedGoalStatuses(goalList.filter(isLinkedGoal));

  useDailyJob({
    lastRunKey: DAILY_GOALS_RESET_KEY,
    isReady: goalsSynced && linkedStatuses.synced,
    run: () => {
      const finishedGoals = goalList.filter(
        (goal) =>
          (isLinkedGoal(goal)
            ? linkedStatuses.findStatus(goal)
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
