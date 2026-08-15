import { WorkTask, WORK_KEY } from "../tabs/Work/types"

const now = Date.now()

function list(id: string, description: string, position: number): WorkTask {
  return {
    id,
    description,
    status: "not_started",
    parentId: WORK_KEY,
    lastStatusUpdate: now,
    position,
  }
}

function task(
  listId: string,
  id: string,
  description: string,
  position: number,
  extra: Partial<WorkTask> = {},
): WorkTask {
  return {
    id,
    description,
    status: "not_started",
    parentId: `${WORK_KEY}/${listId}/items`,
    lastStatusUpdate: now,
    position,
    ...extra,
  }
}

const backlog = list("list-backlog", "Backlog", 0)
const today = list("list-today", "Today", 1)
const done = list("list-done", "Done", 2)

const backlogTask = task(
  backlog.id,
  "task-backlog-1",
  "Set up the mock backend",
  0,
)

const todayTask = task(today.id, "task-today-1", "Try dragging this task", 0, {
  labels: [{ value: "demo", colour: "blue" }],
})

const doneTask = task(done.id, "task-done-1", "See how Done looks", 0, {
  status: "done",
})

export const seedData = {
  [WORK_KEY]: {
    [backlog.id]: { ...backlog, items: { [backlogTask.id]: backlogTask } },
    [today.id]: { ...today, items: { [todayTask.id]: todayTask } },
    [done.id]: { ...done, items: { [doneTask.id]: doneTask } },
  },
}
