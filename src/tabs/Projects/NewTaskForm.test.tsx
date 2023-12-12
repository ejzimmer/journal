import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { NewTaskForm } from "./NewTaskForm"

const defaultProps = {
  onSubmit: jest.fn(),
  colour: "rebeccapurple",
}

describe("NewTaskForm", () => {
  it("shows the new task button", () => {
    render(<NewTaskForm {...defaultProps} />)

    expect(screen.getByRole("button", { name: "New task" })).toBeInTheDocument()
    expect(screen.queryByRole("form")).not.toBeInTheDocument()
  })

  describe("when the user clicks the new task button", () => {
    it("shows the form", async () => {
      render(<NewTaskForm {...defaultProps} />)

      const newTaskButton = screen.getByRole("button", { name: "New task" })
      await userEvent.click(newTaskButton)

      expect(newTaskButton).not.toBeInTheDocument()
      expect(form()).toBeInTheDocument()
    })
  })

  describe("when the user clicks the submit button", () => {
    describe("when the description is empty", () => {
      it("does not submit the form and keeps the form open", async () => {
        const onSubmit = jest.fn()
        render(<NewTaskForm {...defaultProps} onSubmit={onSubmit} />)

        await openForm()
        await userEvent.click(screen.getByRole("button", { name: "Add" }))

        expect(onSubmit).not.toHaveBeenCalled()
        expect(form()).toBeInTheDocument()
      })
    })

    describe("when the input contains text", () => {
      it("submits the form and keeps the input open", async () => {
        const onSubmit = jest.fn()
        render(<NewTaskForm {...defaultProps} onSubmit={onSubmit} />)

        await openForm()
        const input = screen.getByRole("textbox")
        await userEvent.type(input, "Cut the fabric")
        const submitButton = screen.getByRole("button", { name: "Add" })
        await userEvent.click(submitButton)

        expect(onSubmit).toHaveBeenCalledWith("Cut the fabric")
        expect(form()).toBeInTheDocument()
      })
    })
  })

  describe("when the user clicks the cancel button", () => {
    it("calls onCancel and hides the form", async () => {
      render(<NewTaskForm {...defaultProps} />)

      await openForm()
      const cancelButton = screen.getByRole("button", { name: "Cancel" })
      await userEvent.click(cancelButton)

      expect(form()).not.toBeInTheDocument()
    })
  })

  describe("when the user clicks outside the form", () => {
    it("calls onCancel and hides the form", async () => {
      const { container } = render(<NewTaskForm {...defaultProps} />)

      await openForm()
      await userEvent.click(container)

      expect(form()).not.toBeInTheDocument()
    })
  })
})

const form = () => screen.queryByRole("form")
const openForm = () => {
  const newTaskButton = screen.getByRole("button", { name: "New task" })
  return userEvent.click(newTaskButton)
}
