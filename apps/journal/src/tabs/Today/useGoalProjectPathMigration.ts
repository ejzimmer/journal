import { useEffect } from 'react';
import { useStorageContext } from 'shared/FirebaseContext';
import { DAILY_GOALS_KEY } from 'shared/dailyGoals/types';
import { DailyGoalItem } from '../../types';
import { createGoalProjectPathUpdates } from './goalProjectPathMigration';

export function useGoalProjectPathMigration() {
  const { useValue, setValues } = useStorageContext();
  const { value: goals, synced } =
    useValue<Record<string, DailyGoalItem>>(DAILY_GOALS_KEY);

  useEffect(() => {
    if (!synced) return;

    const updates = createGoalProjectPathUpdates(goals);
    if (Object.keys(updates).length > 0) setValues(updates);
  }, [goals, synced, setValues]);
}
