import { useStorageContext } from 'shared/FirebaseContext';
import { useDailyJob } from 'shared/dailyJobs/DailyJobsContext';
import {
  getLinkedPath,
  isLinkedGoal,
  DAILY_GOALS_KEY,
} from 'shared/dailyGoals/types';
import { DAILY_GOALS_RESET_KEY, DailyGoalItem } from '../../types';

type LinkedItem = { status: string };

export function useDailyGoalReset() {
  const { useValue, useValues, setValues } = useStorageContext();
  const { value: goals, synced: goalsSynced } =
    useValue<Record<string, DailyGoalItem>>(DAILY_GOALS_KEY);
  const goalList = Object.values(goals ?? {});
  const linkedGoals = goalList.filter(isLinkedGoal);
  const { values: linkedItems, synced: linkedItemsSynced } =
    useValues<LinkedItem>(linkedGoals.map(getLinkedPath));

  const findStatus = (goal: DailyGoalItem) =>
    isLinkedGoal(goal)
      ? linkedItems[linkedGoals.indexOf(goal)]?.status
      : goal.status;

  useDailyJob({
    lastRunKey: DAILY_GOALS_RESET_KEY,
    isReady: goalsSynced && linkedItemsSynced,
    run: () => {
      const finishedGoals = goalList.filter(
        (goal) => findStatus(goal) !== 'ready',
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
