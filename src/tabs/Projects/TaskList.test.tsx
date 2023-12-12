import { render, screen } from "@testing-library/react"
import { TaskList } from "./TaskList"
import userEvent from "@testing-library/user-event"

const TASKS = [
  { id: "1", description: "Buy fabric", isDone: true },
  { id: "2", description: "Prewash fabric", isDone: false },
  { id: "3", description: "Cut fabric", isDone: false },
]

describe("TaskList", () => {
  it("displays the list of tasks", () => {
    render(<TaskList tasks={TASKS} onAdd={jest.fn()} />)

    const tasks = screen.getAllByRole("listitem")
    tasks.forEach((task, index) => {
      expect(task.textContent).toContain(TASKS[index].description)
    })
  })

  it("adds a new task", async () => {
    const onAdd = jest.fn()
    render(<TaskList tasks={TASKS} onAdd={onAdd} />)

    await userEvent.click(screen.getByRole("button", { name: "➕ New task" }))
    const input = screen.getByRole("textbox", { name: "New task description" })
    await userEvent.type(input, "Mark notches")
    await userEvent.click(screen.getByRole("button", { name: "Add" }))

    expect(onAdd).toHaveBeenCalledWith("Mark notches")
  })

  // add a new task - tick, add task + keep form open
  // add a new task = enter, add task + keep form open
  // open add task form + click cancel = close form
  // open add task form + click outside = close form
  // edit existing task
  // add a subtask list to a task
  // mark tasks as done
  // reorder tasks
  // move tasks between lists
  // add task to today list - make this a prop on the task i think? so it appears in project + today list and ticking on one ticks on both
})
