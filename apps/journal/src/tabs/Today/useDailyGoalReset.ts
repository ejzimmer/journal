import { useStorageContext } from 'shared/FirebaseContext';
import { useDailyJob } from 'shared/dailyJobs/DailyJobsContext';
import { getLinkedPath, DAILY_GOALS_KEY } from 'shared/dailyGoals/types';
import { DAILY_GOALS_RESET_KEY, DailyGoalItem } from '../../types';

type LinkedItem = { status: string };

export function useDailyGoalReset() {
  const { useValue, useValues, setValues } = useStorageContext();
  const { value: goals, synced: goalsSynced } =
    useValue<Record<string, DailyGoalItem>>(DAILY_GOALS_KEY);
  const goalList = Object.values(goals ?? {});
  const { values: linkedItems, synced: linkedItemsSynced } =
    useValues<LinkedItem>(goalList.map(getLinkedPath));

  useDailyJob({
    lastRunKey: DAILY_GOALS_RESET_KEY,
    isReady: goalsSynced && linkedItemsSynced,
    run: () => {
      const finishedGoals = goalList.filter(
        (_, index) => linkedItems[index]?.status !== 'ready',
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
