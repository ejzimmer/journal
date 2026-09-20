import { screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { renderWithStorage } from "../../shared/storageContextTestUtils"
import {
  Category,
  PROJECTS_KEY,
  ProjectDetails,
  ProjectSubtask,
} from "../../shared/types"
import { SubtaskList } from "./SubtaskList"

const projectId = "project-1"
const subtasksKey = `${PROJECTS_KEY}/${projectId}/subtasks`
const category: Category = "🧹"

const project: ProjectDetails = {
  id: projectId,
  parentId: PROJECTS_KEY,
  position: 0,
  description: "Tidy the house",
  category,
}

const makeSubtask = (
  id: string,
  position: number,
  status: ProjectSubtask["status"] = "ready",
): ProjectSubtask => ({ id, description: id, status, category, position })

function renderSubtasks(subtasks: ProjectSubtask[]) {
  const stored = Object.fromEntries(
    subtasks.map((subtask) => [subtask.id, subtask]),
  )
  const addItem = jest.fn()
  const updateItem = jest.fn()

  const result = renderWithStorage(
    <SubtaskList projectId={projectId} isVisible />,
    {
      value: {
        addItem,
        updateItem,
        useValue: <T,>(key?: string) => {
          if (key === `${PROJECTS_KEY}/${projectId}`) {
            return { value: project as T, loading: false }
          }
          if (key === subtasksKey) {
            return { value: stored as T, loading: false }
          }
          return { value: undefined, loading: false }
        },
      },
    },
  )

  return { ...result, addItem, updateItem }
}

const subtaskDescriptions = () =>
  screen
    .getAllByRole("listitem")
    .map((item) => within(item).getByRole("checkbox").getAttribute("aria-label"))

describe("SubtaskList", () => {
  it("shows subtasks in position order", () => {
    renderSubtasks([
      makeSubtask("last", 9),
      makeSubtask("first", 1),
      makeSubtask("middle", 4),
    ])

    expect(subtaskDescriptions()).toEqual([
      "first ready",
      "middle ready",
      "last ready",
    ])
  })

  it("keeps a subtask's position when it's marked as done", async () => {
    const user = userEvent.setup()
    const { updateItem } = renderSubtasks([
      makeSubtask("first", 0),
      makeSubtask("middle", 3),
      makeSubtask("last", 4),
    ])

    await user.click(screen.getByRole("checkbox", { name: "last ready" }))

    expect(updateItem).toHaveBeenCalledWith(subtasksKey, {
      ...makeSubtask("last", 4, "done"),
    })
  })

  it("adds a new subtask past the end when positions have gaps", async () => {
    const user = userEvent.setup()
    const { addItem, container } = renderSubtasks([
      makeSubtask("first", 0),
      makeSubtask("last", 7),
    ])

    await user.click(container.querySelector(".show-form")!)
    await user.type(screen.getByRole("textbox"), "new task{Enter}")

    expect(addItem).toHaveBeenCalledWith(subtasksKey, {
      description: "new task",
      status: "ready",
      category,
      position: 8,
    })
  })
})
