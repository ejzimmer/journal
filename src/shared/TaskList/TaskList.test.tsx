import { render, screen, waitFor } from "@testing-library/react"
import { TASKS } from "./testUtils/MockTaskProvider"
import { TaskList } from "."
import userEvent from "@testing-library/user-event"
import { MockStoreProvider } from "../storage/Store"
import { ItemProvider } from "../storage/ItemManager"
import { ReactElement } from "react"

const TASK = TASKS["1"]
const TASK_LIST = [TASK.id]

const Wrapper = ({
  tasks = TASKS,
  children,
}: {
  tasks?: typeof TASKS
  children: ReactElement
}) => (
  <MockStoreProvider initialItems={tasks}>
    <ItemProvider>{children}</ItemProvider>
  </MockStoreProvider>
)

describe("TaskList", () => {
  describe("when there are no tasks", () => {
    it("displays the empty task message", async () => {
      render(<TaskList taskIds={[]} />, {
        wrapper: Wrapper,
      })

      expect(await screen.findByText("No tasks")).toBeInTheDocument()
    })
  })

  describe("when there are tasks in the list", () => {
    it("displays the list of tasks", async () => {
      render(<TaskList taskIds={TASK_LIST} />, { wrapper: Wrapper })

      expect(screen.queryByText("No tasks")).not.toBeInTheDocument()
      expect(
        await screen.findByRole("checkbox", { name: TASK.description })
      ).toBeInTheDocument()
    })

    describe("when the final task is marked as complete", () => {
      it("notifies the parent that all tasks are complete", async () => {
        const onChangeAllComplete = jest.fn()
        render(
          <TaskList
            taskIds={TASK_LIST}
            onChangeAllComplete={onChangeAllComplete}
          />,
          {
            wrapper: Wrapper,
          }
        )

        await userEvent.click(
          await screen.findByRole("checkbox", { name: "Make shirt" })
        )

        expect(onChangeAllComplete).toHaveBeenCalledWith(true)
      })
    })

    describe("when all tasks are complete", () => {
      describe("and a task is updated to not complete", () => {
        it("notifies the parent that all tasks are no longer complete", async () => {
          const onChangeComplete = jest.fn()
          const taskList = ["11", "12"]
          render(
            <TaskList
              taskIds={taskList}
              onChangeAllComplete={onChangeComplete}
            />,
            { wrapper: Wrapper }
          )

          const checkboxes = await screen.findAllByRole("checkbox")
          await Promise.all(
            checkboxes.map((checkbox) => userEvent.click(checkbox))
          )
          expect(onChangeComplete).toHaveBeenCalledWith(true)

          await userEvent.click(checkboxes[0])

          expect(onChangeComplete).toHaveBeenCalledWith(false)
        })
      })
    })
  })
})
