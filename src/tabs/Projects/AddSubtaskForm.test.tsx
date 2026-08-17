import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { AddSubtaskForm } from "./AddSubtaskForm"

describe("AddSubtaskForm", () => {
  it("adds a subtask when a description is entered", async () => {
    const user = userEvent.setup()
    const onAddSubtask = jest.fn()
    render(<AddSubtaskForm isFormVisible onAddSubtask={onAddSubtask} />)

    await user.type(screen.getByRole("textbox"), "test{Enter}")

    expect(onAddSubtask).toHaveBeenCalledWith("test")
  })

  it("doesn't add a subtask with no description", async () => {
    const user = userEvent.setup()
    const onAddSubtask = jest.fn()
    render(<AddSubtaskForm isFormVisible onAddSubtask={onAddSubtask} />)

    await user.click(screen.getByRole("textbox"))
    await user.keyboard("{Enter}")

    expect(onAddSubtask).not.toHaveBeenCalled()
  })

  it("doesn't add a subtask when the description is only whitespace", async () => {
    const user = userEvent.setup()
    const onAddSubtask = jest.fn()
    render(<AddSubtaskForm isFormVisible onAddSubtask={onAddSubtask} />)

    await user.type(screen.getByRole("textbox"), "   {Enter}")

    expect(onAddSubtask).not.toHaveBeenCalled()
  })
})
