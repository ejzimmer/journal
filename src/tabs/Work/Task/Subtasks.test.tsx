import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { Subtasks } from "./Subtasks"
import { WorkStorageContext, WorkStorageContextType } from "../WorkStorageContext"
import { createWorkStorageContext } from "../workStorageTestUtils"
import { Subtask } from "../types"

function renderWithContext(
  subtasks: Record<string, Subtask> | undefined,
  storageContext: WorkStorageContextType = createWorkStorageContext(),
) {
  return render(
    <WorkStorageContext.Provider value={storageContext}>
      <Subtasks subtasks={subtasks} listId="list-1" taskId="task-1" />
    </WorkStorageContext.Provider>,
  )
}

describe("Subtasks", () => {
  it("renders nothing when there are no subtasks", () => {
    const { container } = renderWithContext(undefined)
    expect(container).toBeEmptyDOMElement()
  })

  it("renders subtask descriptions in position order, separated by commas", () => {
    const { container } = renderWithContext({
      b: { id: "b", description: "create PR", position: 1 },
      a: { id: "a", description: "test", position: 0 },
    })

    expect(container.querySelector(".subtasks")).toHaveTextContent(
      "[test, create PR]",
    )
  })

  it("deletes a subtask when it's clicked, without opening edit mode", async () => {
    const user = userEvent.setup()
    const subtask = { id: "a", description: "test", position: 0 }
    const storageContext = createWorkStorageContext()
    renderWithContext({ a: subtask }, storageContext)

    await user.click(screen.getByRole("button", { name: "test" }))

    expect(storageContext.deleteSubtask).toHaveBeenCalledWith(
      "list-1",
      "task-1",
      subtask,
    )
    expect(
      screen.queryByRole("textbox", { name: "Edit subtasks" }),
    ).not.toBeInTheDocument()
  })

  it("switches to edit mode when clicking anywhere that isn't a subtask", async () => {
    const user = userEvent.setup()
    const { container } = renderWithContext({
      a: { id: "a", description: "test", position: 0 },
      b: { id: "b", description: "build", position: 1 },
    })

    await user.click(container.querySelector(".subtasks")!)

    expect(
      screen.getByRole("textbox", { name: "Edit subtasks" }),
    ).toHaveValue("test, build")
  })

  it("parses the edited text into a new subtask list when Enter is pressed", async () => {
    const user = userEvent.setup()
    const storageContext = createWorkStorageContext()
    const { container } = renderWithContext(
      {
        a: { id: "a", description: "test", position: 0 },
        b: { id: "b", description: "build", position: 1 },
      },
      storageContext,
    )

    await user.click(container.querySelector(".subtasks")!)
    const input = screen.getByRole("textbox", { name: "Edit subtasks" })
    await user.clear(input)
    await user.type(input, "test, review, build{Enter}")

    expect(storageContext.setSubtasks).toHaveBeenCalledWith("list-1", "task-1", [
      { id: "a", description: "test", position: 0 },
      { id: expect.any(String), description: "review", position: 1 },
      { id: "b", description: "build", position: 2 },
    ])
  })

  it("saves the edited list when the field loses focus", async () => {
    const user = userEvent.setup()
    const storageContext = createWorkStorageContext()
    const { container } = renderWithContext(
      { a: { id: "a", description: "test", position: 0 } },
      storageContext,
    )

    await user.click(container.querySelector(".subtasks")!)
    const input = screen.getByRole("textbox", { name: "Edit subtasks" })
    await user.clear(input)
    await user.type(input, "test, extra")
    await user.tab()

    expect(storageContext.setSubtasks).toHaveBeenCalledWith("list-1", "task-1", [
      { id: "a", description: "test", position: 0 },
      { id: expect.any(String), description: "extra", position: 1 },
    ])
  })

  it("filters out blank entries when saving", async () => {
    const user = userEvent.setup()
    const storageContext = createWorkStorageContext()
    const { container } = renderWithContext(
      { a: { id: "a", description: "test", position: 0 } },
      storageContext,
    )

    await user.click(container.querySelector(".subtasks")!)
    const input = screen.getByRole("textbox", { name: "Edit subtasks" })
    await user.clear(input)
    await user.type(input, "test, , build,{Enter}")

    expect(storageContext.setSubtasks).toHaveBeenCalledWith("list-1", "task-1", [
      { id: "a", description: "test", position: 0 },
      { id: expect.any(String), description: "build", position: 1 },
    ])
  })

  it("cancels without saving when Escape is pressed", async () => {
    const user = userEvent.setup()
    const storageContext = createWorkStorageContext()
    const { container } = renderWithContext(
      { a: { id: "a", description: "test", position: 0 } },
      storageContext,
    )

    await user.click(container.querySelector(".subtasks")!)
    await user.type(
      screen.getByRole("textbox", { name: "Edit subtasks" }),
      ", extra",
    )
    await user.keyboard("{Escape}")

    expect(storageContext.setSubtasks).not.toHaveBeenCalled()
    expect(
      screen.queryByRole("textbox", { name: "Edit subtasks" }),
    ).not.toBeInTheDocument()
    expect(screen.getByRole("button", { name: "test" })).toBeInTheDocument()
  })
})
