import { addDays, subDays } from "date-fns"
import {
  createDailyJobsStorage,
  renderDailyJob,
} from "../../../shared/dailyJobs/dailyJobsTestUtils"
import { CALENDAR_KEY, CalendarTask } from "../../../shared/types"
import { useDueDateReset } from "./useDueDateReset"

const createTask = (
  id: string,
  overrides: Partial<CalendarTask> = {},
): CalendarTask => ({
  id,
  description: id,
  category: "🧹",
  parentId: CALENDAR_KEY,
  position: 0,
  status: "ready",
  dueDate: new Date().getTime(),
  statusUpdateDate: new Date().getTime(),
  ...overrides,
})

const indexById = (tasks: CalendarTask[]) =>
  Object.fromEntries(tasks.map((task) => [task.id, task]))

function resetTasks(tasks: CalendarTask[]) {
  const storage = createDailyJobsStorage({ [CALENDAR_KEY]: indexById(tasks) })
  renderDailyJob(useDueDateReset, storage)

  return storage
}

describe("resetting due date tasks", () => {
  it("deletes tasks finished before today", () => {
    const task = createTask("renew-passport", {
      status: "finished",
      dueDate: subDays(new Date(), 2).getTime(),
      statusUpdateDate: subDays(new Date(), 1).getTime(),
    })
    const storage = resetTasks([task])

    expect(storage.deleteItem).toHaveBeenCalledWith(CALENDAR_KEY, task)
  })

  it("keeps tasks finished today", () => {
    const storage = resetTasks([
      createTask("renew-passport", {
        status: "finished",
        dueDate: subDays(new Date(), 2).getTime(),
      }),
    ])

    expect(storage.deleteItem).not.toHaveBeenCalled()
  })

  it("wakes up paused tasks that are due today", () => {
    const storage = resetTasks([createTask("pay-rates", { status: "paused" })])

    expect(storage.updateItem).toHaveBeenCalledWith(
      CALENDAR_KEY,
      expect.objectContaining({ id: "pay-rates", status: "ready" }),
    )
  })

  it("leaves paused tasks that aren't due yet", () => {
    const storage = resetTasks([
      createTask("pay-rates", {
        status: "paused",
        dueDate: addDays(new Date(), 3).getTime(),
      }),
    ])

    expect(storage.updateItem).not.toHaveBeenCalled()
  })

  it("waits for the tasks to arrive before resetting them", () => {
    const storedValues: Record<string, unknown> = {}
    const storage = createDailyJobsStorage(storedValues)

    const { rerender } = renderDailyJob(useDueDateReset, storage)
    expect(storage.updateItem).not.toHaveBeenCalled()

    storedValues[CALENDAR_KEY] = indexById([
      createTask("pay-rates", { status: "paused" }),
    ])
    rerender()

    expect(storage.updateItem).toHaveBeenCalledWith(
      CALENDAR_KEY,
      expect.objectContaining({ id: "pay-rates", status: "ready" }),
    )
  })
})
