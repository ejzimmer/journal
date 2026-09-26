import { useDailyReset } from './tabs/Todo/Today/useDailyReset';
import { useWeeklyReset } from './tabs/Todo/ThisWeek/useWeeklyReset';
import { useDueDateReset } from './tabs/Todo/DueDate/useDueDateReset';
import { useDoneTaskCleanup } from './tabs/Work/useDoneTaskCleanup';
import { useStoredDateMigration } from './useStoredDateMigration';

export function DailyJobs() {
  useStoredDateMigration();
  useDailyReset();
  useWeeklyReset();
  useDueDateReset();
  useDoneTaskCleanup();

  return null;
}
