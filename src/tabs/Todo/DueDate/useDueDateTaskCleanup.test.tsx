import { addDays, subDays } from "date-fns"
import {
  createDailyJobsStorage,
  renderDailyJobs,
} from "../../../shared/dailyJobs/dailyJobsTestUtils"
import { CALENDAR_KEY, CalendarTask } from "../../../shared/types"
import { useDueDateTaskCleanup } from "./useDueDateTaskCleanup"

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

function DueDateTaskCleanup() {
  useDueDateTaskCleanup()
  return null
}

function runCleanup(tasks: CalendarTask[]) {
  const storage = createDailyJobsStorage({
    [CALENDAR_KEY]: Object.fromEntries(tasks.map((task) => [task.id, task])),
  })
  renderDailyJobs(<DueDateTaskCleanup />, storage)

  return storage
}

describe("cleaning up due date tasks", () => {
  it("deletes tasks finished before today", () => {
    const task = createTask("renew-passport", {
      status: "finished",
      dueDate: subDays(new Date(), 2).getTime(),
      statusUpdateDate: subDays(new Date(), 1).getTime(),
    })
    const storage = runCleanup([task])

    expect(storage.deleteItem).toHaveBeenCalledWith(CALENDAR_KEY, task)
  })

  it("keeps tasks finished today", () => {
    const storage = runCleanup([
      createTask("renew-passport", {
        status: "finished",
        dueDate: subDays(new Date(), 2).getTime(),
      }),
    ])

    expect(storage.deleteItem).not.toHaveBeenCalled()
  })

  it("wakes up paused tasks that are due today", () => {
    const storage = runCleanup([createTask("pay-rates", { status: "paused" })])

    expect(storage.updateItem).toHaveBeenCalledWith(
      CALENDAR_KEY,
      expect.objectContaining({ id: "pay-rates", status: "ready" }),
    )
  })

  it("leaves paused tasks that aren't due yet", () => {
    const storage = runCleanup([
      createTask("pay-rates", {
        status: "paused",
        dueDate: addDays(new Date(), 3).getTime(),
      }),
    ])

    expect(storage.updateItem).not.toHaveBeenCalled()
  })

  it("does nothing until the tasks have loaded", () => {
    const storage = createDailyJobsStorage()
    renderDailyJobs(<DueDateTaskCleanup />, storage)

    expect(storage.deleteItem).not.toHaveBeenCalled()
    expect(storage.updateItem).not.toHaveBeenCalled()
  })
})
