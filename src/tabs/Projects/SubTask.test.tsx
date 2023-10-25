import { render, screen } from "@testing-library/react"
import { SubTask } from "./SubTask"
import userEvent from "@testing-library/user-event"

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
        />
      )

      const task = screen.getByRole("checkbox", { name: /Cut out the pattern/ })
      await userEvent.click(task)

      expect(onDoneChange).toHaveBeenCalledWith(true)
    })
  })

  describe("when the user clicks the delete button", () => {
    it("calls the onDelete handler", async () => {
      const onDelete = jest.fn()
      const onDoneChange = jest.fn()
      render(
        <SubTask
          title="Buy more fabric"
          isDone={false}
          onDoneChange={onDoneChange}
          onDelete={onDelete}
          onTitleChange={jest.fn()}
        />
      )

      const deleteButton = screen.getByRole("button", {
        name: "Delete task: Buy more fabric",
      })
      await userEvent.click(deleteButton)

      expect(onDelete).toHaveBeenCalled()
      expect(onDoneChange).not.toHaveBeenCalled()
    })
  })
})
