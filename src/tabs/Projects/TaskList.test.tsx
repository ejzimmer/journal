import { render, screen } from "@testing-library/react"
import { TaskList } from "./TaskList"
import userEvent from "@testing-library/user-event"

const TASKS = [
  { id: "1", description: "Buy fabric", isDone: true },
  { id: "2", description: "Prewash fabric", isDone: false },
  { id: "3", description: "Cut fabric", isDone: false },
]

const defaultProps = {
  tasks: TASKS,
  onAdd: jest.fn(),
  onChange: jest.fn(),
  onDelete: jest.fn(),
}

describe("TaskList", () => {
  it("displays the list of tasks", () => {
    render(<TaskList {...defaultProps} />)

    TASKS.forEach((task) => {
      expect(screen.getByText(task.description)).toBeInTheDocument()
    })
  })

  it("adds a new task", async () => {
    const onAdd = jest.fn()
    render(<TaskList {...defaultProps} onAdd={onAdd} />)

    await userEvent.click(screen.getByRole("button", { name: "➕ New task" }))
    const input = screen.getByRole("textbox", { name: "New task description" })
    await userEvent.type(input, "Mark notches")
    await userEvent.click(screen.getByRole("button", { name: "Add" }))

    expect(onAdd).toHaveBeenCalledWith("Mark notches")
  })

  it("edits a task description", async () => {
    const onChange = jest.fn()
    const { container } = render(
      <TaskList {...defaultProps} onChange={onChange} />
    )

    const input = await getTask(1)
    await userEvent.type(input!, "x")
    await userEvent.click(container)

    expect(onChange).toHaveBeenCalledWith({
      ...TASKS[1],
      description: `${TASKS[1].description}x`,
    })
  })

  describe("when the user clicks the delete button", () => {
    it("removes the task from the list", async () => {
      const onDelete = jest.fn()
      render(<TaskList {...defaultProps} onDelete={onDelete} />)

      await userEvent.click(
        screen.getByRole("button", { name: "Delete Buy fabric" })
      )

      expect(onDelete).toHaveBeenCalledWith("1")
    })
  })

  describe("when the user deletes the description", () => {
    it("removes the task", async () => {
      const onDelete = jest.fn()
      const { container } = render(
        <TaskList {...defaultProps} onDelete={onDelete} />
      )

      await userEvent.clear(await getTask(0)!)
      await userEvent.click(container)

      expect(onDelete).toHaveBeenCalledWith("1")
    })
  })

  // remove task by clearing - enter/click away
  // mark tasks as done
  // add a subtask list to a task
  // reorder tasks
  // move tasks between lists
  // add task to today list - make this a prop on the task i think? so it appears in project + today list and ticking on one ticks on both
})

const getTask = async (index: number) => {
  await userEvent.click(screen.getByText(TASKS[index].description))

  return screen.getByRole("textbox")
}
