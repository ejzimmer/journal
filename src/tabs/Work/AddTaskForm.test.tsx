import { fireEvent, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { AddTaskForm } from "./AddTaskForm"

const commonProps = {
  onSubmit: jest.fn(),
  onClose: jest.fn(),
}

describe("AddTaskForm", () => {
  it("adds a task with just a description", async () => {
    const user = userEvent.setup()
    const onSubmit = jest.fn()
    render(<AddTaskForm {...commonProps} onSubmit={onSubmit} />)

    const descriptionInput = screen.getByRole("textbox", {
      name: "Description",
    })
    await user.type(descriptionInput, "Approve PR")
    await user.keyboard("{Enter}")

    expect(onSubmit).toHaveBeenCalledWith({ description: "Approve PR" })
  })

  it("doesn't add a task with just a due date", async () => {
    const user = userEvent.setup()
    const onSubmit = jest.fn()
    render(<AddTaskForm {...commonProps} onSubmit={onSubmit} />)

    // Testing library doesn't handle date inputs well
    const dateInput = screen.getByLabelText("Due date")
    fireEvent.change(dateInput, { target: { value: "2026-01-01" } })

    await user.keyboard("{Enter}")

    expect(onSubmit).not.toHaveBeenCalled()
  })

  it("adds a task with a due date and a description", async () => {
    const user = userEvent.setup()
    const onSubmit = jest.fn()
    render(<AddTaskForm {...commonProps} onSubmit={onSubmit} />)

    const descriptionInput = screen.getByRole("textbox", {
      name: "Description",
    })
    await user.type(descriptionInput, "Approve PR")
    // Testing library doesn't handle date inputs well
    const dateInput = screen.getByLabelText("Due date")
    fireEvent.change(dateInput, { target: { value: "2026-01-01" } })
    await user.keyboard("{Enter}")

    expect(onSubmit).toHaveBeenCalledWith({
      description: "Approve PR",
      dueDate: new Date("2026-01-01").getTime(),
    })
  })

  describe("when the user presses the Escape key", () => {
    it("call onCancel", async () => {
      const user = userEvent.setup()
      const onCancel = jest.fn()
      render(<AddTaskForm {...commonProps} onClose={onCancel} />)

      const descriptionInput = screen.getByRole("textbox", {
        name: "Description",
      })
      await user.type(descriptionInput, "Approve PR")
      // Testing library doesn't handle date inputs well
      const dateInput = screen.getByLabelText("Due date")
      fireEvent.change(dateInput, { target: { value: "2026-01-01" } })
      await user.keyboard("{Escape}")

      expect(onCancel).toHaveBeenCalled()
    })
  })
})
