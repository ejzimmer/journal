import { subDays } from "date-fns"
import {
  createDailyJobsStorage,
  renderDailyJob,
} from "../../../shared/dailyJobs/dailyJobsTestUtils"
import { DAILY_KEY, DailyTask } from "../../../shared/types"
import { useDailyReset } from "./useDailyReset"

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

const indexById = (tasks: DailyTask[]) =>
  Object.fromEntries(tasks.map((task) => [task.id, task]))

function resetTasks(tasks: DailyTask[]) {
  const storage = createDailyJobsStorage({ [DAILY_KEY]: indexById(tasks) })
  renderDailyJob(useDailyReset, storage)

  return storage
}

describe("resetting daily tasks", () => {
  it("makes tasks done on an earlier day ready again", () => {
    const storage = resetTasks([
      createTask("washing-up", { status: "done", position: 0 }),
      createTask("exercise", { status: "ready", position: 1 }),
    ])

    expect(storage.updateList).toHaveBeenCalledWith(DAILY_KEY, [
      expect.objectContaining({ id: "washing-up", status: "ready" }),
      expect.objectContaining({ id: "exercise", status: "ready" }),
    ])
  })

  it("removes one-off tasks finished on an earlier day", () => {
    const storage = resetTasks([
      createTask("book-flights", { type: "一度", status: "finished" }),
      createTask("exercise", { position: 1 }),
    ])

    expect(storage.updateList).toHaveBeenCalledWith(DAILY_KEY, [
      expect.objectContaining({ id: "exercise" }),
    ])
  })

  it("keeps tasks finished today", () => {
    const storage = resetTasks([
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
    const storage = resetTasks([
      createTask("book-flights", { type: "一度", status: "finished" }),
      createTask("exercise", { position: 1 }),
      createTask("washing-up", { position: 2 }),
    ])

    expect(storage.updateList).toHaveBeenCalledWith(DAILY_KEY, [
      expect.objectContaining({ id: "exercise", position: 0 }),
      expect.objectContaining({ id: "washing-up", position: 1 }),
    ])
  })

  it("waits for the tasks to arrive before resetting them", () => {
    const storedValues: Record<string, unknown> = {}
    const storage = createDailyJobsStorage(storedValues)

    const { rerender } = renderDailyJob(useDailyReset, storage)
    expect(storage.updateList).not.toHaveBeenCalled()

    storedValues[DAILY_KEY] = indexById([
      createTask("washing-up", { status: "done" }),
    ])
    rerender()

    expect(storage.updateList).toHaveBeenCalledWith(DAILY_KEY, [
      expect.objectContaining({ id: "washing-up", status: "ready" }),
    ])
  })
})
