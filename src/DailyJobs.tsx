import { useDailyReset } from './tabs/Todo/Today/useDailyReset';
import { useWeeklyReset } from './tabs/Todo/ThisWeek/useWeeklyReset';
import { useDueDateReset } from './tabs/Todo/DueDate/useDueDateReset';
import { useDoneTaskCleanup } from './tabs/Work/useDoneTaskCleanup';

export function DailyJobs() {
  useDailyReset();
  useWeeklyReset();
  useDueDateReset();
  useDoneTaskCleanup();

  return null;
}
