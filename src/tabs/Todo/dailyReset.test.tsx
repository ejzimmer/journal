import { isBefore } from "date-fns"
import { dailyReset } from "./dailyReset"
import { Task } from "./types"

const createTask = (task: Partial<Task>): Task => ({
  id: crypto.randomUUID(),
  description: "brush teeth",
  category: { text: "chore", emoji: "" },
  type: "日付",
  lastUpdated: Date.now(),
  status: "ready",
  ...task,
})

describe("dailyReset", () => {
  it("removes any task with status of finished", () => {
    const tasks = [
      createTask({ status: "ready" }),
      createTask({ status: "finished" }),
      createTask({ status: "blocked" }),
      createTask({ status: "done" }),
    ]
    expect(dailyReset(tasks)).toEqual([tasks[0], tasks[2], tasks[3]])
  })

  it("resets any everyday tasks to ready", () => {
    jest.useFakeTimers()
    jest.setSystemTime(new Date("2025-11-07T12:00:07"))

    const tasks = [
      createTask({ type: "毎日", status: "ready" }),
      createTask({ type: "毎日", status: "finished" }),
      createTask({ type: "毎日", status: "blocked" }),
      createTask({
        type: "毎日",
        description: "brush teeth",
        status: "done",
        lastUpdated: new Date("2025-11-07T09:23:33").getTime(),
      }),
      createTask({
        type: "毎日",
        description: "brush hair",
        status: "done",
        lastUpdated: new Date("2025-11-05").getTime(),
      }),
    ]
    expect(dailyReset(tasks)).toEqual([
      tasks[0],
      tasks[2],
      tasks[3],
      { ...tasks[4], status: "ready" },
    ])

    jest.useRealTimers()
  })

  it("removes any completed markers that are over a week old", () => {
    jest.useFakeTimers()
    jest.setSystemTime(new Date("2025-11-07"))

    const task = {
      ...createTask({
        type: "週に",
      }),
      completed: [new Date("2025-10-31"), new Date("2025-11-06")],
    }

    expect(dailyReset([task])).toEqual([
      { ...task, completed: [task.completed[1]] },
    ])

    jest.useRealTimers()
  })
})
