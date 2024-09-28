import { render, screen } from "@testing-library/react"
import { Task } from "./Task"
import userEvent from "@testing-library/user-event"
import { ItemResponse, UpdateItemContext } from "../storage/Context"
import { ReactNode } from "react"
import { Item } from "./types"
import { MockTaskProvider, TASKS } from "./testUtils/MockTaskProvider"

const TASK = TASKS["1"]

const renderTask = (
  id: string,
  callbacks?: Partial<ItemResponse> & Partial<UpdateItemContext>
) =>
  render(<Task id={id} />, {
    wrapper: ({ children }: { children: ReactNode }) => (
      <MockTaskProvider {...callbacks}>{children}</MockTaskProvider>
    ),
  })

describe("Item", () => {
  it("shows the task description & status", async () => {
    renderTask(TASK.id)

    expect(await screen.findByText(TASK.description)).toBeInTheDocument()
    expect(
      screen.getByRole("checkbox", { name: TASK.description })
    ).toBeInTheDocument()
  })

  it("edits the description", async () => {
    const onChange = jest.fn()
    const user = userEvent.setup()
    renderTask(TASK.id, { onChange })

    await user.click(await screen.findByText(TASK.description))
    const descriptionInput = screen.getByRole("textbox")
    await user.clear(descriptionInput)
    await user.type(descriptionInput, "Make jacket{Enter}")

    expect(onChange).toHaveBeenCalledWith({
      ...TASK,
      description: "Make jacket",
    })
  })

  it("changes the status of the task", async () => {
    const onChange = jest.fn()
    const user = userEvent.setup()
    renderTask(TASK.id, { onChange })

    await user.click(
      await screen.findByRole("checkbox", { name: TASK.description })
    )

    expect(onChange).toHaveBeenCalledWith({ ...TASK, isComplete: true })
  })

  it("deletes the task", async () => {
    const onDelete = jest.fn()
    const user = userEvent.setup()
    renderTask(TASK.id, { onDelete })

    await user.click(
      await screen.findByRole("button", { name: `Delete ${TASK.description}` })
    )
    await user.click(await screen.findByRole("button", { name: "Delete task" }))

    expect(onDelete).toHaveBeenCalled()
  })

  describe("when the task can't be fetched", () => {
    it("shows an error", async () => {
      renderTask(TASK.id, { error: new Error("Could not fetch task") })

      expect(
        await screen.findByText("Could not fetch task")
      ).toBeInTheDocument()
    })
  })

  it("can add a subtask by pressing enter", async () => {
    const onAddSubtask = jest.fn()
    const user = userEvent.setup()
    renderTask(TASK.id, { onAddTask: onAddSubtask })

    await user.click(
      await screen.findByRole("button", {
        name: `Add subtask to ${TASK.description}`,
      })
    )

    const newTaskInput = screen.getByRole("textbox", {
      name: "Task description",
    })
    expect(newTaskInput).toBeInTheDocument()
    await user.type(newTaskInput, "buy fabric")
    await user.keyboard("{Enter}")

    expect(onAddSubtask).toHaveBeenCalledWith("1", "buy fabric")
    expect(newTaskInput).toHaveValue("")
  })

  it("can add a subtask by clicking the button", async () => {
    const onAddSubtask = jest.fn()
    const user = userEvent.setup()
    renderTask(TASK.id, { onAddTask: onAddSubtask })

    await user.click(
      await screen.findByRole("button", {
        name: `Add subtask to ${TASK.description}`,
      })
    )

    const newTaskInput = screen.getByRole("textbox", {
      name: "Task description",
    })
    expect(newTaskInput).toBeInTheDocument()
    await user.type(newTaskInput, "buy fabric")
    await user.click(screen.getByRole("button", { name: "Add" }))

    expect(onAddSubtask).toHaveBeenCalledWith("1", "buy fabric")
    expect(newTaskInput).toHaveValue("")
  })

  describe("when the user clicks Add subtask, then cancel", () => {
    it("closes the Add subtask form", async () => {
      const user = userEvent.setup()
      renderTask(TASK.id)

      await user.click(
        await screen.findByRole("button", {
          name: `Add subtask to ${TASK.description}`,
        })
      )

      const newTaskInput = screen.getByRole("textbox", {
        name: "Task description",
      })
      expect(newTaskInput).toBeInTheDocument()
      await user.type(newTaskInput, "buy fabric")
      await user.click(screen.getByRole("button", { name: "Cancel" }))

      expect(newTaskInput).not.toBeInTheDocument()
    })
  })

  describe("when the user clicks Add subtask, then clicks away", () => {
    it("closes the Add subtask form", async () => {
      const user = userEvent.setup()
      const { container } = renderTask(TASK.id)

      await user.click(
        await screen.findByRole("button", {
          name: `Add subtask to ${TASK.description}`,
        })
      )

      const newTaskInput = screen.getByRole("textbox", {
        name: "Task description",
      })
      expect(newTaskInput).toBeInTheDocument()
      await user.type(newTaskInput, "buy fabric")
      await user.click(container)

      expect(newTaskInput).not.toBeInTheDocument()
    })
  })

  describe("when the task has subtasks", () => {
    it("displays them", async () => {
      const subtasks = ["11", "12", "13"] as const
      const taskWithSubtasks: Item = {
        ...TASK,
        items: ["11", "12", "13"],
      }
      renderTask(TASK.id, { item: taskWithSubtasks })

      const labels = subtasks.map((id) => TASKS[id].description)

      const tasks = await Promise.all(
        labels.map((label) => screen.findByRole("checkbox", { name: label }))
      )
      tasks.forEach((task) => expect(task).toBeInTheDocument())
    })

    // move to other list
    // rearrange items
  })
})
