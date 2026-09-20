import { isBefore, startOfDay } from "date-fns"
import { useStorageContext } from "../../../shared/FirebaseContext"
import { useDailyJob } from "../../../shared/dailyJobs/DailyJobsContext"
import { sortByPosition } from "../../../shared/drag-and-drop/utils"
import { DAILY_KEY, DAILY_RESET_KEY, DailyTask } from "../../../shared/types"

const finishedBeforeToday = (task: DailyTask) =>
  task.status === "finished" &&
  isBefore(task.lastCompleted, startOfDay(new Date()))

const readyForToday = (task: DailyTask) =>
  task.status === "done"
    ? { ...task, status: "ready" as const, lastCompleted: new Date().getTime() }
    : task

export function useDailyTaskCleanup() {
  const { useValue, updateList } = useStorageContext()
  const { value: tasksById } = useValue<Record<string, DailyTask>>(DAILY_KEY)

  useDailyJob({
    lastRunKey: DAILY_RESET_KEY,
    isReady: tasksById !== undefined,
    run: () => {
      const tasks = sortByPosition(Object.values(tasksById ?? {}))
      const remainingTasks = tasks
        .filter((task) => !finishedBeforeToday(task))
        .map((task, position) => ({ ...readyForToday(task), position }))

      updateList(DAILY_KEY, remainingTasks)
    },
  })
}
