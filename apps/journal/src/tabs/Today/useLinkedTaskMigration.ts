import { useEffect } from 'react';
import { useStorageContext } from 'shared/FirebaseContext';
import {
  DailyTask,
  ONCE_KEY,
  ProjectDetails,
  PROJECTS_KEY,
  DailyGoalItem,
} from '../../types';
import { DAILY_GOALS_KEY } from 'shared/dailyGoals/types';
import { createLinkedTaskMigration } from './linkedTaskMigration';

export function useLinkedTaskMigration() {
  const { useValue, setValues } = useStorageContext();
  const once = useValue<Record<string, DailyTask>>(ONCE_KEY);
  const goals = useValue<Record<string, DailyGoalItem>>(DAILY_GOALS_KEY);
  const projects = useValue<Record<string, ProjectDetails>>(PROJECTS_KEY);
  const synced = once.synced && goals.synced && projects.synced;

  useEffect(() => {
    if (!synced) return;

    const updates = createLinkedTaskMigration({
      onceTasks: once.value,
      goals: goals.value,
      projects: projects.value,
    });
    if (Object.keys(updates).length > 0) setValues(updates);
  }, [once.value, goals.value, projects.value, synced, setValues]);
}
