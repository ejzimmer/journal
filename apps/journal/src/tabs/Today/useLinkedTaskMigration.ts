import { useEffect } from 'react';
import { useStorageContext } from 'shared/FirebaseContext';
import {
  DailyTask,
  ONCE_KEY,
  ProjectDetails,
  PROJECTS_KEY,
  TodaySlot,
} from '../../types';
import { TODAY_SLOTS_KEY } from 'shared/todaySlots/types';
import { createLinkedTaskMigration } from './linkedTaskMigration';

export function useLinkedTaskMigration() {
  const { useValue, setValues } = useStorageContext();
  const once = useValue<Record<string, DailyTask>>(ONCE_KEY);
  const slots = useValue<Record<string, TodaySlot>>(TODAY_SLOTS_KEY);
  const projects = useValue<Record<string, ProjectDetails>>(PROJECTS_KEY);
  const synced = once.synced && slots.synced && projects.synced;

  useEffect(() => {
    if (!synced) return;

    const updates = createLinkedTaskMigration({
      onceTasks: once.value,
      slots: slots.value,
      projects: projects.value,
    });
    if (Object.keys(updates).length > 0) setValues(updates);
  }, [once.value, slots.value, projects.value, synced, setValues]);
}
