import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { MoveToOtherLists } from "./MoveToOtherLists"
import { FirebaseContext } from "../../shared/FirebaseContext"
import { WorkTask } from "./types"

const task: WorkTask = {
  id: "task-1",
  description: "Fix contrast",
  status: "not_started",
  parentId: "list-1",
  lastStatusUpdate: 0,
  position: 0,
}

const sourceList: WorkTask = {
  id: "list-1",
  description: "a11y backlog",
  status: "not_started",
  parentId: "work",
  lastStatusUpdate: 0,
  position: 0,
  labelIds: ["label-a11y"],
}

const destinationList: WorkTask = {
  id: "list-2",
  description: "Today",
  status: "not_started",
  parentId: "work",
  lastStatusUpdate: 0,
  position: 1,
}

const storageContext = {
  addItem: jest.fn(),
  updateItem: jest.fn(),
  deleteItem: jest.fn(),
  updateList: jest.fn(),
  useValue: () => ({ value: undefined, loading: false }),
}

const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <FirebaseContext.Provider value={storageContext}>
    {children}
  </FirebaseContext.Provider>
)

describe("MoveToOtherLists", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it("adds the source list's label to the task when moved", async () => {
    const user = userEvent.setup()
    render(
      <MoveToOtherLists
        allLists={[sourceList, destinationList]}
        currentListId={sourceList.id}
        task={task}
      />,
      { wrapper: Wrapper },
    )

    await user.click(screen.getByRole("menuitem", { name: "Today" }))

    expect(storageContext.addItem).toHaveBeenCalledWith(
      "work/list-2/items",
      expect.objectContaining({
        labelIds: ["label-a11y"],
      }),
    )
  })
})
