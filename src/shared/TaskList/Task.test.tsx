import { render, screen } from "@testing-library/react"
import { Task } from "./Task"
import userEvent from "@testing-library/user-event"
import {
  FetchItem,
  ItemResponse,
  UpdateItem,
  UpdateItemContext,
} from "../storage/Context"
import { ReactNode } from "react"
import { Item } from "./types"

const TASK: Item = { id: "1", description: "Make shirt", isComplete: false }
const SUBTASKS: Item[] = [
  { id: "12", description: "Buy fabric", isComplete: false },
  { id: "13", description: "Prewash fabric", isComplete: false },
  { id: "14", description: "Cut pattern", isComplete: false },
]

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
  context: { item, error, isLoading },
  children,
}: {
  context: ItemResponse
  children: ReactNode
}) => {
  return (
    <FetchItem.Provider
      value={(id: string) => {
        if (isLoading) {
          return new Promise(() => undefined)
        }
        if (error) {
          return Promise.reject(error)
        }
        return Promise.resolve(
          item ?? SUBTASKS.find((i) => i.id === id) ?? TASK
        )
      }}
    >
      {children}
    </FetchItem.Provider>
  )
}

const renderTask = (
  callbacks?: Partial<ItemResponse> & Partial<UpdateItemContext>
) =>
  render(<Task id={TASK.id} />, {
    wrapper: ({ children }: { children: ReactNode }) => {
      const { item, error, isLoading, ...updateTask } = callbacks ?? {}
      return (
        <FetchTaskProvider
          context={{ item, error, isLoading: isLoading ?? false }}
        >
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

    expect(await screen.findByText(TASK.description)).toBeInTheDocument()
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
      renderTask({ error: new Error("Could not fetch task") })

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

    expect(onAddSubtask).toHaveBeenCalledWith("1", "buy fabric")
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

    expect(onAddSubtask).toHaveBeenCalledWith("1", "buy fabric")
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

  xdescribe("when the task has subtasks", () => {
    it("displays them", async () => {
      const taskWithSubtasks: Item = {
        ...TASK,
        items: ["11", "12", "13"],
      }
      renderTask({ item: taskWithSubtasks })

      SUBTASKS.forEach(({ description }) =>
        expect(
          screen.getByRole("checkbox", { name: description })
        ).toBeInTheDocument()
      )
    })

    // display subtasks
    // move to other list
    // rearrange items
  })
})
