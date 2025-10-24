import { render, screen } from "@testing-library/react"
import { AddTaskForm } from "./AddTaskForm"
import userEvent from "@testing-library/user-event"

describe("AddTaskForm", () => {
  describe("when the user presses submit without entering a description or choosing a type", () => {
    it("shows a validation error & doesn't submit", async () => {
      const user = userEvent.setup()
      const onSubmit = jest.fn()
      render(<AddTaskForm onSubmit={onSubmit} />)

      await user.click(screen.getByRole("button", { name: "Create task" }))

      expect(screen.getByText("Description required")).toBeInTheDocument()
      expect(screen.getByText("Type required")).toBeInTheDocument()
      expect(onSubmit).not.toHaveBeenCalled()
    })
  })
  // validation: type = weekly, default to frequency: 1
  // validation: type = calendar, date is required
  // can add label with colour & emoji
})
