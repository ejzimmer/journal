import { render, screen } from "@testing-library/react"
import { MockTaskProvider, TASKS } from "./testUtils/MockTaskProvider"
import { TaskList } from "."
import userEvent from "@testing-library/user-event"

const TASK = TASKS["1"]
const TASK_LIST = [TASK.id]

describe("TaskList", () => {
  describe("when there are no tasks", () => {
    it("displays the empty task message, & the add task form", () => {
      render(<TaskList tasks={[]} />, {
        wrapper: MockTaskProvider,
      })

      expect(screen.getByText("No tasks")).toBeInTheDocument()
      expect(
        screen.getByRole("textbox", { name: "Task description" })
      ).toBeInTheDocument()
    })

    describe("when the user adds a task", () => {
      it("calls onAddTask with the task description", async () => {
        const onAddTask = jest.fn()
        render(<TaskList tasks={[]} />, {
          wrapper: ({ children }) => (
            <MockTaskProvider onAddTask={onAddTask}>
              {children}
            </MockTaskProvider>
          ),
        })

        await userEvent.type(
          screen.getByRole("textbox", { name: "Task description" }),
          "Buy thread{Enter}"
        )

        expect(onAddTask).toHaveBeenCalledWith("Buy thread")
      })
    })
  })

  it("displays the list of tasks, and task form", async () => {
    render(<TaskList tasks={TASK_LIST} />, { wrapper: MockTaskProvider })

    expect(screen.queryByText("No tasks")).not.toBeInTheDocument()
    expect(
      await screen.findByRole("checkbox", { name: TASK.description })
    ).toBeInTheDocument()
    expect(
      screen.getByRole("textbox", { name: "Task description" })
    ).toBeInTheDocument()
  })
})
