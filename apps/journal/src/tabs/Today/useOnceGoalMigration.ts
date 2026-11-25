import { useEffect } from 'react';
import { useStorageContext } from 'shared/FirebaseContext';
import { DAILY_GOALS_KEY } from 'shared/dailyGoals/types';
import { DailyTask, ONCE_KEY, DailyGoalItem } from '../../types';
import { createOnceGoalMigration } from './onceGoalMigration';

export function useOnceGoalMigration() {
  const { useValue, setValues } = useStorageContext();
  const once = useValue<Record<string, DailyTask>>(ONCE_KEY);
  const goals = useValue<Record<string, DailyGoalItem>>(DAILY_GOALS_KEY);
  const synced = once.synced && goals.synced;

  useEffect(() => {
    if (!synced) return;

    const updates = createOnceGoalMigration({
      onceTasks: once.value,
      goals: goals.value,
    });
    if (Object.keys(updates).length > 0) setValues(updates);
  }, [once.value, goals.value, synced, setValues]);
}
