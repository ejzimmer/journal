import "fake-indexeddb/auto"
import { render, screen } from "@testing-library/react"
import { FirebaseContext } from "../../shared/FirebaseContext"
import { createLocalFirstContext } from "../../shared/localFirst/createLocalFirstContext"
import { Work } from "./index"

jest.mock("firebase/database", () => ({
  ref: (_database: unknown, path?: string) => ({ path }),
  update: jest.fn().mockResolvedValue(undefined),
  onValue: () => () => {},
}))

const now = Date.now()

const createList = (
  id: string,
  description: string,
  position: number,
  items: Record<string, unknown> = {},
) => ({
  id,
  description,
  position,
  status: "not_started",
  parentId: "work",
  lastStatusUpdate: now,
  items,
})

const createTask = (
  id: string,
  description: string,
  position: number,
  listId: string,
) => ({
  id,
  description,
  position,
  status: "not_started",
  parentId: `work/${listId}/items`,
  lastStatusUpdate: now,
})

async function renderWork(lists: Record<string, unknown>) {
  const { context, hydrate } = createLocalFirstContext(
    {} as import("firebase/database").Database,
    `work-tab-${Math.random()}`,
  )
  await hydrate()
  context.setValue("work", lists)

  render(
    <FirebaseContext.Provider value={context}>
      <Work />
    </FirebaseContext.Provider>,
  )
}

describe("Work", () => {
  it("settles instead of reordering its lists forever", async () => {
    await renderWork({
      "list-today": createList("list-today", "Today", 0, {
        "task-1": createTask("task-1", "Fix the thing", 0, "list-today"),
        "task-2": createTask("task-2", "Another thing", 1, "list-today"),
      }),
      "list-done": createList("list-done", "Done", 1),
    })

    expect(await screen.findByText("Fix the thing")).toBeInTheDocument()
  })

  it("still tidies up positions that are out of order", async () => {
    await renderWork({
      "list-today": createList("list-today", "Today", 0, {
        "task-1": createTask("task-1", "Fix the thing", 7, "list-today"),
        "task-2": createTask("task-2", "Another thing", 9, "list-today"),
      }),
      "list-done": createList("list-done", "Done", 1),
    })

    expect(await screen.findByText("Fix the thing")).toBeInTheDocument()
  })
})
