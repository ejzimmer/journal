import { useDailyReset } from './tabs/Today/useDailyReset';
import { useOnceReset } from './tabs/Today/useOnceReset';
import { useWeeklyReset } from './tabs/Today/useWeeklyReset';
import { useDueDateReset } from './tabs/Today/useDueDateReset';
import { useTodaySnapshot } from './tabs/Today/useTodaySnapshot';
import { useDailyGoalReset } from './tabs/Today/useDailyGoalReset';
import { useWorkDailyUpdate } from './tabs/Work/useWorkDailyUpdate';

export function DailyJobs() {
  useDailyReset();
  useOnceReset();
  useWeeklyReset();
  useDueDateReset();
  useTodaySnapshot();
  useDailyGoalReset();
  useWorkDailyUpdate();

  return null;
}
