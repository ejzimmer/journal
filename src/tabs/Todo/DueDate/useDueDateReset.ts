import { isBefore, isSameDay, startOfDay } from "date-fns"
import { useStorageContext } from "../../../shared/FirebaseContext"
import { useDailyJob } from "../../../shared/dailyJobs/DailyJobsContext"
import {
  CALENDAR_KEY,
  CALENDAR_RESET_KEY,
  CalendarTask,
} from "../../../shared/types"

const readyToDelete = (task: CalendarTask) => {
  const today = startOfDay(new Date())
  return (
    task.status === "finished" &&
    isBefore(task.dueDate, today) &&
    isBefore(task.statusUpdateDate, today)
  )
}

const taskIsToday = (task: CalendarTask) => isSameDay(task.dueDate, new Date())

export function useDueDateReset() {
  const { useValue, deleteItem, updateItem } = useStorageContext()
  const { value: tasksById } = useValue<Record<string, CalendarTask>>(
    CALENDAR_KEY,
  )

  useDailyJob({
    lastRunKey: CALENDAR_RESET_KEY,
    isReady: tasksById !== undefined,
    run: () => {
      const tasks = Object.values(tasksById ?? {})

      tasks
        .filter(readyToDelete)
        .forEach((task) => deleteItem<CalendarTask>(CALENDAR_KEY, task))

      tasks
        .filter((task) => taskIsToday(task) && task.status === "paused")
        .forEach((task) =>
          updateItem(CALENDAR_KEY, { ...task, status: "ready" }),
        )
    },
  })
}
