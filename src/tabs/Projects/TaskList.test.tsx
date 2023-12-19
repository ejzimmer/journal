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

  describe("when the user clicks the checkbox", () => {
    it("marks the task as done", async () => {
      const onChange = jest.fn()
      render(<TaskList {...defaultProps} onChange={onChange} />)

      const task = TASKS[1]

      await userEvent.click(
        screen.getByRole("checkbox", { name: `${task.description} done` })
      )

      expect(onChange).toHaveBeenCalledWith({
        ...task,
        isDone: true,
      })
    })
  })

  describe("when create subtasks button is clicked", () => {
    it("adds a task list as a child of the task", async () => {
      const onChange = jest.fn()
      render(<TaskList {...defaultProps} onChange={onChange} />)

      const task = TASKS[0]
      await userEvent.click(
        screen.getByRole("button", {
          name: `Add subtasks to ${task.description}`,
        })
      )

      expect(onChange).toHaveBeenCalledWith({
        ...task,
        tasks: [],
      })
    })
  })

  describe("when there is a subtask list", () => {
    const taskWithSubtasks = {
      ...TASKS[0],
      tasks: [
        {
          id: "0-0",
          description: "Buy merino",
          isDone: true,
        },
        { id: "0-1", description: "Buy zipper", isDone: false },
        { id: "0-2", description: "Buy thread", isDone: false },
      ],
    }

    it("hides the add subtasks button and shows the list of subtasks", () => {
      render(<TaskList {...defaultProps} tasks={[taskWithSubtasks]} />)

      expect(
        screen.queryByRole("button", {
          name: `Add subtasks to ${taskWithSubtasks.description}`,
        })
      ).not.toBeInTheDocument()
      expect(
        screen.getByRole("checkbox", { name: "Buy merino done" })
      ).toBeChecked()
      expect(
        screen.getByRole("checkbox", { name: "Buy zipper done" })
      ).not.toBeChecked()
      expect(
        screen.getByRole("checkbox", { name: "Buy thread done" })
      ).not.toBeChecked()
    })

    it("adds a task to the subtask list", async () => {
      const taskWithSubtasks = { ...TASKS[0], tasks: [] }
      const onChange = jest.fn()
      render(
        <TaskList
          {...defaultProps}
          onChange={onChange}
          tasks={[taskWithSubtasks]}
        />
      )

      await userEvent.click(
        screen.getByRole("button", { name: "➕ New subtask" })
      )
      await userEvent.type(screen.getByRole("textbox"), "Buy merino")
      await userEvent.keyboard("{Enter}")

      expect(onChange).toHaveBeenCalledWith({
        ...taskWithSubtasks,
        tasks: [{ description: "Buy merino" }],
      })
    })

    it("updates a subtask", async () => {
      const onChange = jest.fn()
      render(
        <TaskList
          {...defaultProps}
          tasks={[taskWithSubtasks]}
          onChange={onChange}
        />
      )

      await userEvent.click(screen.getByText("Buy merino"))
      const input = screen.getByRole("textbox")
      await userEvent.clear(input)
      await userEvent.type(input, "Buy cotton")
      await userEvent.keyboard("{Enter}")

      const [firstTask, ...remainingTasks] = taskWithSubtasks.tasks
      expect(onChange).toHaveBeenCalledWith({
        ...taskWithSubtasks,
        tasks: [{ ...firstTask, description: "Buy cotton" }, ...remainingTasks],
      })
    })
  })

  // when the last subtask is removed, remove the list
  // reorder tasks
  // move tasks between lists
  // add task to today list - make this a prop on the task i think? so it appears in project + today list and ticking on one ticks on both. no actually, just move it to the list with same id, but change/deletes need to check for all IDs
})

const getTask = async (index: number) => {
  await userEvent.click(screen.getByText(TASKS[index].description))

  return screen.getByRole("textbox")
}
