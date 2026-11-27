import { useDailyReset } from './tabs/Todo/Today/useDailyReset';
import { useOnceReset } from './tabs/Todo/Today/useOnceReset';
import { useWeeklyReset } from './tabs/Todo/ThisWeek/useWeeklyReset';
import { useDueDateReset } from './tabs/Todo/DueDate/useDueDateReset';
import { useTodaySnapshot } from './tabs/Today/useTodaySnapshot';
import { useDailyGoalReset } from './tabs/Today/useDailyGoalReset';
import { useLegacyTrackerMigration } from './tabs/Health/calories/useLegacyTrackerMigration';
import { useWorkDailyUpdate } from './tabs/Work/useWorkDailyUpdate';

export function DailyJobs() {
  useLegacyTrackerMigration();
  useDailyReset();
  useOnceReset();
  useWeeklyReset();
  useDueDateReset();
  useTodaySnapshot();
  useDailyGoalReset();
  useWorkDailyUpdate();

  return null;
}
