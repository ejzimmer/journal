import { useDailyReset } from './tabs/Todo/Today/useDailyReset';
import { useOnceReset } from './tabs/Todo/Today/useOnceReset';
import { useOnceListMigration } from './tabs/Todo/Today/useOnceListMigration';
import { useWeeklyReset } from './tabs/Todo/ThisWeek/useWeeklyReset';
import { useDueDateReset } from './tabs/Todo/DueDate/useDueDateReset';
import { useTodaySnapshot } from './tabs/Today/useTodaySnapshot';
import { useDailyGoalReset } from './tabs/Today/useDailyGoalReset';
import { useLinkedTaskMigration } from './tabs/Today/useLinkedTaskMigration';
import { useGoalProjectPathMigration } from './tabs/Today/useGoalProjectPathMigration';
import { useOnceGoalMigration } from './tabs/Today/useOnceGoalMigration';
import { useWorkDailyUpdate } from './tabs/Work/useWorkDailyUpdate';

export function DailyJobs() {
  useOnceListMigration();
  useLinkedTaskMigration();
  useGoalProjectPathMigration();
  useOnceGoalMigration();
  useDailyReset();
  useOnceReset();
  useWeeklyReset();
  useDueDateReset();
  useTodaySnapshot();
  useDailyGoalReset();
  useWorkDailyUpdate();

  return null;
}
