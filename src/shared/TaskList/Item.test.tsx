import {
  render,
  screen,
  waitForElementToBeRemoved,
} from "@testing-library/react"
import { Item } from "./Item"
import userEvent from "@testing-library/user-event"
import {
  FetchTask,
  FetchTaskContext,
  UpdateTask,
  UpdateTaskContext,
} from "../storage/Context"
import { ReactNode } from "react"

const TASK = { id: "1", description: "Make shirt", isDone: false }

const UpdateTaskProvider = ({
  context,
  children,
}: {
  context?: Partial<UpdateTaskContext>
  children: ReactNode
}) => (
  <UpdateTask.Provider
    value={{
      onChange: context?.onChange ?? jest.fn(),
      onDelete: context?.onDelete ?? jest.fn(),
    }}
  >
    {children}
  </UpdateTask.Provider>
)
const FetchTaskProvider = ({
  context,
  children,
}: {
  context?: Partial<FetchTaskContext>
  children: ReactNode
}) => (
  <FetchTask.Provider
    value={{ getTask: context?.getTask ?? jest.fn().mockResolvedValue(TASK) }}
  >
    {children}
  </FetchTask.Provider>
)

const renderTask = (
  callbacks?: Partial<FetchTaskContext> & Partial<UpdateTaskContext>
) =>
  render(<Item id="1" />, {
    wrapper: ({ children }: { children: ReactNode }) => {
      const { getTask, ...updateTask } = callbacks ?? {}
      return (
        <FetchTaskProvider context={{ getTask }}>
          <UpdateTaskProvider context={{ ...updateTask }}>
            {children}
          </UpdateTaskProvider>
        </FetchTaskProvider>
      )
    },
  })

describe("Item", () => {
  it("shows a loading indicator & then the task description & status", async () => {
    renderTask()

    const loadingIndicator = screen.getByText("Loading...")
    expect(loadingIndicator).toBeInTheDocument()
    await waitForElementToBeRemoved(loadingIndicator)

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

    expect(onChange).toHaveBeenCalledWith({ ...TASK, isDone: true })
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
      const getTask = jest.fn().mockRejectedValue("Could not fetch task")
      renderTask({ getTask })

      expect(
        await screen.findByText("Could not fetch task")
      ).toBeInTheDocument()
    })
  })

  // add subtasks
  // move to list
})
