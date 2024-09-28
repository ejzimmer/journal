import { render, screen } from "@testing-library/react"
import { MockTaskProvider, TASKS } from "./testUtils/MockTaskProvider"
import { TaskList } from "."
import userEvent from "@testing-library/user-event"

const TASK = TASKS["1"]
const TASK_LIST = [TASK.id]

describe("TaskList", () => {
  describe("when there are no tasks", () => {
    it("displays the empty task message", () => {
      render(<TaskList tasks={[]} />, {
        wrapper: MockTaskProvider,
      })

      expect(screen.getByText("No tasks")).toBeInTheDocument()
    })
  })

  describe("when there are tasks in the list", () => {
    it("displays the list of tasks", async () => {
      render(<TaskList tasks={TASK_LIST} />, { wrapper: MockTaskProvider })

      expect(screen.queryByText("No tasks")).not.toBeInTheDocument()
      expect(
        await screen.findByRole("checkbox", { name: TASK.description })
      ).toBeInTheDocument()
    })
  })
})
