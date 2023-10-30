import { render, screen } from "@testing-library/react"
import { SubTask } from "./SubTask"
import userEvent from "@testing-library/user-event"
import { List } from "@chakra-ui/react"

describe("SubTask", () => {
  describe("when the user clicks the sub-task", () => {
    it("toggles the status between done & not done", async () => {
      const onDoneChange = jest.fn()
      render(
        <SubTask
          title="Cut out the pattern"
          isDone={false}
          onDoneChange={onDoneChange}
          onDelete={jest.fn()}
          onTitleChange={jest.fn()}
        />,
        { wrapper: List }
      )

      const task = screen.getByRole("checkbox", { name: /Cut out the pattern/ })
      await userEvent.click(task)

      expect(onDoneChange).toHaveBeenCalledWith(true)
    })
  })

  describe("when the user clicks the delete button", () => {
    it("shows a confirmation dialogue, then calls the onDelete handler", async () => {
      const onDelete = jest.fn()
      const onDoneChange = jest.fn()
      render(
        <SubTask
          title="Buy more fabric"
          isDone={false}
          onDoneChange={onDoneChange}
          onDelete={onDelete}
          onTitleChange={jest.fn()}
        />,
        { wrapper: List }
      )

      const deleteButton = screen.getByRole("button", {
        name: "Delete task: Buy more fabric",
      })
      await userEvent.click(deleteButton)

      expect(
        screen.getByText("Are you sure you want to delete Buy more fabric?")
      ).toBeInTheDocument()

      await userEvent.click(screen.getByRole("button", { name: "Yes" }))

      expect(onDelete).toHaveBeenCalled()
      expect(onDoneChange).not.toHaveBeenCalled()
    })
  })

  describe("when the user edits the task title", () => {
    it("does not mark the task as done", async () => {
      const onDoneChange = jest.fn()
      render(
        <SubTask
          title="Buy more fabric"
          isDone={false}
          onDoneChange={onDoneChange}
          onDelete={jest.fn()}
          onTitleChange={jest.fn()}
        />,
        { wrapper: List }
      )

      await userEvent.click(
        screen.getByRole("textbox", { name: "Task description" })
      )

      expect(screen.getByRole("textbox")).toBeInTheDocument()
      expect(onDoneChange).not.toHaveBeenCalled()
    })
  })
})
