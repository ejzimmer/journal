import { subDays } from "date-fns"
import {
  createDailyJobsStorage,
  renderDailyJobs,
} from "../../../shared/dailyJobs/dailyJobsTestUtils"
import { DAILY_KEY, DailyTask } from "../../../shared/types"
import { useDailyTaskCleanup } from "./useDailyTaskCleanup"

const yesterday = () => subDays(new Date(), 1).getTime()

const createTask = (
  id: string,
  overrides: Partial<DailyTask> = {},
): DailyTask => ({
  id,
  description: id,
  category: "🧹",
  parentId: DAILY_KEY,
  position: 0,
  type: "毎日",
  status: "ready",
  lastCompleted: yesterday(),
  ...overrides,
})

function DailyTaskCleanup() {
  useDailyTaskCleanup()
  return null
}

function runCleanup(tasks: DailyTask[]) {
  const storage = createDailyJobsStorage({
    [DAILY_KEY]: Object.fromEntries(tasks.map((task) => [task.id, task])),
  })
  renderDailyJobs(<DailyTaskCleanup />, storage)

  return storage
}

describe("cleaning up daily tasks", () => {
  it("makes tasks done on an earlier day ready again", () => {
    const storage = runCleanup([
      createTask("washing-up", { status: "done", position: 0 }),
      createTask("exercise", { status: "ready", position: 1 }),
    ])

    expect(storage.updateList).toHaveBeenCalledWith(DAILY_KEY, [
      expect.objectContaining({ id: "washing-up", status: "ready" }),
      expect.objectContaining({ id: "exercise", status: "ready" }),
    ])
  })

  it("removes one-off tasks finished on an earlier day", () => {
    const storage = runCleanup([
      createTask("book-flights", { type: "一度", status: "finished" }),
      createTask("exercise", { position: 1 }),
    ])

    expect(storage.updateList).toHaveBeenCalledWith(DAILY_KEY, [
      expect.objectContaining({ id: "exercise" }),
    ])
  })

  it("keeps tasks finished today", () => {
    const storage = runCleanup([
      createTask("book-flights", {
        type: "一度",
        status: "finished",
        lastCompleted: new Date().getTime(),
      }),
    ])

    expect(storage.updateList).toHaveBeenCalledWith(DAILY_KEY, [
      expect.objectContaining({ id: "book-flights", status: "finished" }),
    ])
  })

  it("closes the gaps left by the tasks it removed", () => {
    const storage = runCleanup([
      createTask("book-flights", { type: "一度", status: "finished" }),
      createTask("exercise", { position: 1 }),
      createTask("washing-up", { position: 2 }),
    ])

    expect(storage.updateList).toHaveBeenCalledWith(DAILY_KEY, [
      expect.objectContaining({ id: "exercise", position: 0 }),
      expect.objectContaining({ id: "washing-up", position: 1 }),
    ])
  })

  it("does nothing until the tasks have loaded", () => {
    const storage = createDailyJobsStorage()
    renderDailyJobs(<DailyTaskCleanup />, storage)

    expect(storage.updateList).not.toHaveBeenCalled()
  })
})
