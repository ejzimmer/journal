import { useDailyReset } from './tabs/Todo/Today/useDailyReset';
import { useOnceReset } from './tabs/Todo/Today/useOnceReset';
import { useOnceListMigration } from './tabs/Todo/Today/useOnceListMigration';
import { useWeeklyReset } from './tabs/Todo/ThisWeek/useWeeklyReset';
import { useDueDateReset } from './tabs/Todo/DueDate/useDueDateReset';
import { useTodaySnapshot } from './tabs/Today/useTodaySnapshot';
import { useTodaySlotsReset } from './tabs/Today/useTodaySlotsReset';
import { useLinkedTaskMigration } from './tabs/Today/useLinkedTaskMigration';
import { useWorkDailyUpdate } from './tabs/Work/useWorkDailyUpdate';

export function DailyJobs() {
  useOnceListMigration();
  useLinkedTaskMigration();
  useDailyReset();
  useOnceReset();
  useWeeklyReset();
  useDueDateReset();
  useTodaySnapshot();
  useTodaySlotsReset();
  useWorkDailyUpdate();

  return null;
}
