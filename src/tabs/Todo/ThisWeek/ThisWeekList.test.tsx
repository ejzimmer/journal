import { subDays } from "date-fns"
import { WeeklyTask } from "../../../shared/types"
import { refreshTasks } from "./ThisWeekList"

const mockTask: WeeklyTask = {
  id: "2",
  description: "strength training",
  category: { emoji: "e", text: "exercise" },
  parentId: "WEEKLY",
  frequency: 2,
  position: 4,
}

describe("updating done tasks", () => {
  beforeEach(() => {
    jest.useFakeTimers()
    jest.setSystemTime(new Date("2026-02-28T13:10:57.000Z"))
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  describe("when the task hasn't been completed", () => {
    it("does nothing", () => {
      const updateTask = jest.fn()
      refreshTasks([mockTask], updateTask)

      expect(updateTask).not.toHaveBeenCalled()
    })
  })

  describe("when the task hasn't been completed in the last 7 days", () => {
    it("does nothing", () => {
      const completed = [
        subDays(new Date(), 4).getTime(),
        subDays(new Date(), 2).getTime(),
      ]
      const updateTask = jest.fn()
      refreshTasks([{ ...mockTask, completed }], updateTask)

      expect(updateTask).not.toHaveBeenCalled()
    })
  })

  describe("when the task was completed more than 7 days ago", () => {
    it("calls update task with the outdated completed tasks removed", () => {
      const completed = [
        subDays(new Date(), 12).getTime(),
        subDays(new Date(), 8).getTime(),
        subDays(new Date(), 4).getTime(),
        subDays(new Date(), 2).getTime(),
      ]
      const updateTask = jest.fn()
      refreshTasks([{ ...mockTask, completed }], updateTask)

      expect(updateTask).toHaveBeenCalledWith({
        ...mockTask,
        completed: [completed[2], completed[3]],
      })
    })
  })

  describe("when the task was completed exactly 7 days ago", () => {
    it("calls update task with the outdated completed tasks removed", () => {
      const completed = [
        subDays(new Date(), 12).getTime(),
        new Date("2026-02-21T23:10:57.000Z").getTime(), // 7 days ago, but later in the day
        subDays(new Date(), 4).getTime(),
        subDays(new Date(), 2).getTime(),
      ]
      const updateTask = jest.fn()
      refreshTasks([{ ...mockTask, completed }], updateTask)

      expect(updateTask).toHaveBeenCalledWith({
        ...mockTask,
        completed: [completed[2], completed[3]],
      })
    })
  })

  describe("when the completed array is actually a record", () => {
    it("deals with that too", () => {
      const completed = {
        "1": subDays(new Date(), 8).getTime(),
        "2": subDays(new Date(), 4).getTime(),
        "3": subDays(new Date(), 2).getTime(),
      } as unknown as number[] // Firebase turns sparse arrays into objects
      const updateTask = jest.fn()
      refreshTasks([{ ...mockTask, completed }], updateTask)
    })
  })
})
