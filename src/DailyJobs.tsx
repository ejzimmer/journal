import { useDailyReset } from './tabs/Todo/Today/useDailyReset';
import { useWeeklyReset } from './tabs/Todo/ThisWeek/useWeeklyReset';
import { useDueDateReset } from './tabs/Todo/DueDate/useDueDateReset';
import { useWorkDailyUpdate } from './tabs/Work/useWorkDailyUpdate';

export function DailyJobs() {
  useDailyReset();
  useWeeklyReset();
  useDueDateReset();
  useWorkDailyUpdate();

  return null;
}
