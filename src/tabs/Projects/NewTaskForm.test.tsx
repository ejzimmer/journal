import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { NewTaskForm } from "./NewTaskForm"

describe("NewTaskForm", () => {
  describe("when the user clicks the submit button", () => {
    describe("when the description is empty", () => {
      it("does not submit the form", async () => {
        const onSubmit = jest.fn()
        render(<NewTaskForm onSubmit={onSubmit} onCancel={jest.fn()} />)

        await userEvent.click(screen.getByRole("button", { name: "Add" }))

        expect(onSubmit).not.toHaveBeenCalled()
      })
    })
    it("submits the form", async () => {
      const onSubmit = jest.fn()
      render(<NewTaskForm onSubmit={onSubmit} onCancel={jest.fn()} />)

      const input = screen.getByRole("textbox")
      await userEvent.type(input, "Cut the fabric")
      const submitButton = screen.getByRole("button", { name: "Add" })
      await userEvent.click(submitButton)

      expect(onSubmit).toHaveBeenCalledWith("Cut the fabric")
    })
  })

  describe("when the user clicks the cancel button", () => {
    it("calls onCancel", async () => {
      const onCancel = jest.fn()
      render(<NewTaskForm onSubmit={jest.fn()} onCancel={onCancel} />)

      const cancelButton = screen.getByRole("button", { name: "Cancel" })
      await userEvent.click(cancelButton)

      expect(onCancel).toHaveBeenCalled()
    })
  })

  describe("when the user clicks outside the form", () => {
    it("calls onCancel", async () => {
      const onCancel = jest.fn()
      const { container } = render(
        <NewTaskForm onSubmit={jest.fn()} onCancel={onCancel} />
      )

      await userEvent.click(container)

      expect(onCancel).toHaveBeenCalled()
    })
  })
})
