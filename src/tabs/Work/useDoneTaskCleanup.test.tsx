import { subDays } from "date-fns"
import {
  createDailyJobsStorage,
  renderDailyJob,
} from "../../shared/dailyJobs/dailyJobsTestUtils"
import { WorkTask, WORK_KEY } from "./types"
import { useDoneTaskCleanup } from "./useDoneTaskCleanup"

const createList = (
  id: string,
  description: string,
  position: number,
  items: WorkTask[] = [],
): WorkTask => ({
  id,
  description,
  status: "not_started",
  parentId: WORK_KEY,
  lastStatusUpdate: new Date().getTime(),
  position,
  items: indexById(items),
})

const createTask = (
  listId: string,
  id: string,
  overrides: Partial<WorkTask> = {},
): WorkTask => ({
  id,
  description: id,
  status: "not_started",
  parentId: `${WORK_KEY}/${listId}/items`,
  lastStatusUpdate: new Date().getTime(),
  position: 0,
  ...overrides,
})

function indexById(items: WorkTask[]) {
  return Object.fromEntries(items.map((item) => [item.id, item]))
}

function cleanUpLists(lists: WorkTask[]) {
  const storage = createDailyJobsStorage({ [WORK_KEY]: indexById(lists) })
  renderDailyJob(useDoneTaskCleanup, storage)

  return storage
}

describe("cleaning up done work tasks", () => {
  it("moves tasks done on an earlier day to the done list", () => {
    const storage = cleanUpLists([
      createList("today", "Today", 0, [
        createTask("today", "fix-the-thing", {
          status: "done",
          lastStatusUpdate: subDays(new Date(), 1).getTime(),
        }),
      ]),
      createList("done", "Done", 1),
    ])

    expect(storage.addItem).toHaveBeenCalledWith(
      `${WORK_KEY}/done/items`,
      expect.objectContaining({
        description: "fix-the-thing",
        parentId: `${WORK_KEY}/done/items`,
      }),
    )
    expect(storage.updateList).toHaveBeenCalledWith(
      `${WORK_KEY}/today/items`,
      [],
    )
  })

  it("leaves tasks finished today where they are", () => {
    const storage = cleanUpLists([
      createList("today", "Today", 0, [
        createTask("today", "fix-the-thing", { status: "done" }),
      ]),
      createList("done", "Done", 1),
    ])

    expect(storage.addItem).not.toHaveBeenCalled()
    expect(storage.updateList).not.toHaveBeenCalled()
  })

  it("tidies up positions that are out of order", () => {
    const storage = cleanUpLists([
      createList("today", "Today", 0, [
        createTask("today", "fix-the-thing", { position: 7 }),
        createTask("today", "another-thing", { position: 9 }),
      ]),
      createList("done", "Done", 1),
    ])

    expect(storage.updateList).toHaveBeenCalledWith(`${WORK_KEY}/today/items`, [
      expect.objectContaining({ description: "fix-the-thing", position: 0 }),
      expect.objectContaining({ description: "another-thing", position: 1 }),
    ])
  })

  it("leaves lists whose positions are already in order alone", () => {
    const storage = cleanUpLists([
      createList("today", "Today", 0, [
        createTask("today", "fix-the-thing", { position: 0 }),
        createTask("today", "another-thing", { position: 1 }),
      ]),
      createList("done", "Done", 1),
    ])

    expect(storage.updateList).not.toHaveBeenCalled()
  })

  it("does nothing without a done list", () => {
    const storage = cleanUpLists([
      createList("today", "Today", 0, [
        createTask("today", "fix-the-thing", {
          status: "done",
          lastStatusUpdate: subDays(new Date(), 1).getTime(),
        }),
      ]),
    ])

    expect(storage.addItem).not.toHaveBeenCalled()
    expect(storage.updateList).not.toHaveBeenCalled()
  })

  it("waits for the lists to arrive before cleaning them up", () => {
    const storedValues: Record<string, unknown> = {}
    const storage = createDailyJobsStorage(storedValues)

    const { rerender } = renderDailyJob(useDoneTaskCleanup, storage)
    expect(storage.addItem).not.toHaveBeenCalled()

    storedValues[WORK_KEY] = indexById([
      createList("today", "Today", 0, [
        createTask("today", "fix-the-thing", {
          status: "done",
          lastStatusUpdate: subDays(new Date(), 1).getTime(),
        }),
      ]),
      createList("done", "Done", 1),
    ])
    rerender()

    expect(storage.addItem).toHaveBeenCalledWith(
      `${WORK_KEY}/done/items`,
      expect.objectContaining({ description: "fix-the-thing" }),
    )
  })
})
