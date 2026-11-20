import { useDailyReset } from './tabs/Todo/Today/useDailyReset';
import { useOnceReset } from './tabs/Todo/Today/useOnceReset';
import { useOnceListMigration } from './tabs/Todo/Today/useOnceListMigration';
import { useWeeklyReset } from './tabs/Todo/ThisWeek/useWeeklyReset';
import { useDueDateReset } from './tabs/Todo/DueDate/useDueDateReset';
import { useWorkDailyUpdate } from './tabs/Work/useWorkDailyUpdate';

export function DailyJobs() {
  useOnceListMigration();
  useDailyReset();
  useOnceReset();
  useWeeklyReset();
  useDueDateReset();
  useWorkDailyUpdate();

  return null;
}
