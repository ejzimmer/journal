import { render, screen } from "@testing-library/react"
import { Task } from "./Task"
import userEvent from "@testing-library/user-event"
import {
  FetchItem,
  FetchItemContext,
  UpdateItem,
  UpdateItemContext,
} from "../storage/Context"
import { ReactNode } from "react"
import { Item } from "./types"

const TASK: Item = { id: "1", description: "Make shirt", isComplete: false }

const UpdateTaskProvider = ({
  context,
  children,
}: {
  context?: Partial<UpdateItemContext>
  children: ReactNode
}) => (
  <UpdateItem.Provider
    value={{
      onChange: context?.onChange ?? jest.fn(),
      onDelete: context?.onDelete ?? jest.fn(),
      onAddSubtask: context?.onAddSubtask ?? jest.fn(),
    }}
  >
    {children}
  </UpdateItem.Provider>
)
const FetchTaskProvider = ({
  context: { item, error },
  children,
}: {
  context: FetchItemContext
  children: ReactNode
}) => (
  <FetchItem.Provider value={{ item: item ?? error ? undefined : TASK, error }}>
    {children}
  </FetchItem.Provider>
)

const renderTask = (
  callbacks?: Partial<FetchItemContext> & Partial<UpdateItemContext>
) =>
  render(<Task />, {
    wrapper: ({ children }: { children: ReactNode }) => {
      const { item, error, ...updateTask } = callbacks ?? {}
      return (
        <FetchTaskProvider context={{ item, error }}>
          <UpdateTaskProvider context={{ ...updateTask }}>
            {children}
          </UpdateTaskProvider>
        </FetchTaskProvider>
      )
    },
  })

describe("Item", () => {
  it("shows the task description & status", async () => {
    renderTask()

    expect(screen.getByText(TASK.description)).toBeInTheDocument()
    expect(
      screen.getByRole("checkbox", { name: TASK.description })
    ).toBeInTheDocument()
  })

  it("edits the description", async () => {
    const onChange = jest.fn()
    const user = userEvent.setup()
    renderTask({ onChange })

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
    renderTask({ onChange })

    await user.click(
      await screen.findByRole("checkbox", { name: TASK.description })
    )

    expect(onChange).toHaveBeenCalledWith({ ...TASK, isComplete: true })
  })

  it("deletes the task", async () => {
    const onDelete = jest.fn()
    const user = userEvent.setup()
    renderTask({ onDelete })

    await user.click(
      await screen.findByRole("button", { name: `Delete ${TASK.description}` })
    )
    await user.click(await screen.findByRole("button", { name: "Delete task" }))

    expect(onDelete).toHaveBeenCalled()
  })

  describe("when the task can't be fetched", () => {
    it("shows an error", async () => {
      renderTask({ error: "Could not fetch task" })

      expect(
        await screen.findByText("Could not fetch task")
      ).toBeInTheDocument()
    })
  })

  it("can add a subtask by pressing enter", async () => {
    const onAddSubtask = jest.fn()
    const user = userEvent.setup()
    renderTask({ onAddSubtask })

    await user.click(
      await screen.findByRole("button", {
        name: `Add subtask to ${TASK.description}`,
      })
    )

    const newTaskInput = screen.getByRole("textbox", {
      name: "Subtask description",
    })
    expect(newTaskInput).toBeInTheDocument()
    await user.type(newTaskInput, "buy fabric")
    await user.keyboard("{Enter}")

    expect(onAddSubtask).toHaveBeenCalledWith("buy fabric")
    expect(newTaskInput).toHaveValue("")
  })

  it("can add a subtask by clicking the button", async () => {
    const onAddSubtask = jest.fn()
    const user = userEvent.setup()
    renderTask({ onAddSubtask })

    await user.click(
      await screen.findByRole("button", {
        name: `Add subtask to ${TASK.description}`,
      })
    )

    const newTaskInput = screen.getByRole("textbox", {
      name: "Subtask description",
    })
    expect(newTaskInput).toBeInTheDocument()
    await user.type(newTaskInput, "buy fabric")
    await user.click(screen.getByRole("button", { name: "Add" }))

    expect(onAddSubtask).toHaveBeenCalledWith("buy fabric")
    expect(newTaskInput).toHaveValue("")
  })

  describe("when the user clicks Add subtask, then cancel", () => {
    it("closes the Add subtask form", async () => {
      const user = userEvent.setup()
      renderTask()

      await user.click(
        await screen.findByRole("button", {
          name: `Add subtask to ${TASK.description}`,
        })
      )

      const newTaskInput = screen.getByRole("textbox", {
        name: "Subtask description",
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
      const { container } = renderTask()

      await user.click(
        await screen.findByRole("button", {
          name: `Add subtask to ${TASK.description}`,
        })
      )

      const newTaskInput = screen.getByRole("textbox", {
        name: "Subtask description",
      })
      expect(newTaskInput).toBeInTheDocument()
      await user.type(newTaskInput, "buy fabric")
      await user.click(container)

      expect(newTaskInput).not.toBeInTheDocument()
    })
  })

  // disallow subtasks
  // display subtasks
  // move to other list
  // rearrange items
})
