import { useEffect } from "react"
import { isBefore, isSameDay, startOfDay } from "date-fns"
import { useStorageContext } from "../../../shared/FirebaseContext"
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
  const { useValue, deleteItem, updateItem, setValue } = useStorageContext()

  const { value: tasksById, loading: tasksLoading } =
    useValue<Record<string, CalendarTask>>(CALENDAR_KEY)
  const { value: lastReset, loading: resetLoading } =
    useValue<number>(CALENDAR_RESET_KEY)

  useEffect(() => {
    if (tasksLoading || resetLoading) return
    if (lastReset !== undefined && !isBefore(lastReset, startOfDay(new Date())))
      return

    const tasks = Object.values(tasksById ?? {})

    tasks
      .filter(readyToDelete)
      .forEach((task) => deleteItem<CalendarTask>(CALENDAR_KEY, task))

    tasks
      .filter((task) => taskIsToday(task) && task.status === "paused")
      .forEach((task) => updateItem(CALENDAR_KEY, { ...task, status: "ready" }))

    setValue(CALENDAR_RESET_KEY, new Date().getTime())
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tasksLoading, resetLoading, lastReset])
}
