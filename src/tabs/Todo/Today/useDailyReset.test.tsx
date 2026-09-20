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
  describe("a task done on an earlier day", () => {
    it("is ready again", () => {
      const storage = resetTasks([
        createTask("washing-up", { status: "done", position: 0 }),
        createTask("exercise", { status: "ready", position: 1 }),
      ])

      expect(storage.updateList).toHaveBeenCalledWith(DAILY_KEY, [
        expect.objectContaining({ id: "washing-up", status: "ready" }),
        expect.objectContaining({ id: "exercise", status: "ready" }),
      ])
    })
  })

  describe("a one-off task finished on an earlier day", () => {
    it("is removed", () => {
      const storage = resetTasks([
        createTask("book-flights", { type: "一度", status: "finished" }),
        createTask("exercise", { position: 1 }),
      ])

      expect(storage.updateList).toHaveBeenCalledWith(DAILY_KEY, [
        expect.objectContaining({ id: "exercise" }),
      ])
    })

    it("leaves no gap in the positions behind it", () => {
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
  })

  describe("a one-off task finished today", () => {
    it("is left alone", () => {
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
  })

  describe("when the tasks haven't arrived yet", () => {
    it("resets nothing", () => {
      const storage = createDailyJobsStorage({})

      renderDailyJob(useDailyReset, storage)

      expect(storage.updateList).not.toHaveBeenCalled()
    })

    it("resets them once they arrive", () => {
      const storedValues: Record<string, unknown> = {}
      const storage = createDailyJobsStorage(storedValues)

      const { rerender } = renderDailyJob(useDailyReset, storage)

      storedValues[DAILY_KEY] = indexById([
        createTask("washing-up", { status: "done" }),
      ])
      rerender()

      expect(storage.updateList).toHaveBeenCalledWith(DAILY_KEY, [
        expect.objectContaining({ id: "washing-up", status: "ready" }),
      ])
    })
  })
})
