import { useDailyTaskCleanup } from "./tabs/Todo/Today/useDailyTaskCleanup"
import { useWeeklyTaskUpdate } from "./tabs/Todo/ThisWeek/useWeeklyTaskUpdate"
import { useDueDateTaskCleanup } from "./tabs/Todo/DueDate/useDueDateTaskCleanup"
import { useDoneTaskCleanup } from "./tabs/Work/useDoneTaskCleanup"

export function DailyJobs() {
  useDailyTaskCleanup()
  useWeeklyTaskUpdate()
  useDueDateTaskCleanup()
  useDoneTaskCleanup()

  return null
}
