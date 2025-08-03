import userEvent from "@testing-library/user-event"
import { Modal, ModalTriggerProps } from "./Modal"
import { render, screen } from "@testing-library/react"

HTMLDialogElement.prototype.show = function mock(this: HTMLDialogElement) {
  this.open = true
}
HTMLDialogElement.prototype.showModal = function mock(this: HTMLDialogElement) {
  this.open = true
}
HTMLDialogElement.prototype.close = function mock(this: HTMLDialogElement) {
  this.open = false
}

const defaultProps = {
  trigger: (props: ModalTriggerProps) => <button {...props}>trigger</button>,
  children: <>content</>,
}

describe("modal", () => {
  describe("when the user clicks the trigger", () => {
    it("opens the modal", async () => {
      const user = userEvent.setup()
      render(<Modal {...defaultProps} />)

      await user.click(screen.getByRole("button", { name: "trigger" }))

      expect(screen.getByText("content")).toBeVisible()
    })
  })

  describe("when the user clicks the x button", () => {
    it("closes the modal", async () => {
      const user = userEvent.setup()
      render(<Modal {...defaultProps} />)
      await user.click(screen.getByRole("button", { name: "trigger" }))
      const modalContent = screen.getByText("content")

      await user.click(screen.getByRole("button", { name: "close modal" }))

      expect(modalContent).not.toBeVisible()
    })
  })

  describe("when the user clicks the submit button", () => {
    it("performs the action & closes the modal", async () => {
      const user = userEvent.setup()
      const onSubmit = jest.fn()
      render(
        <Modal trigger={(props) => <button {...props}>trigger</button>}>
          <form>
            <label>
              <input type="checkbox" /> checkbox
            </label>
            <Modal.Action onAction={onSubmit}>submit</Modal.Action>
          </form>
        </Modal>
      )

      await user.click(screen.getByRole("button", { name: "trigger" }))
      await user.click(screen.getByRole("button", { name: "submit" }))

      expect(onSubmit).toHaveBeenCalled()
      expect(screen.queryByRole("checkbox")).not.toBeInTheDocument()
    })
  })

  describe("when the user clicks the cancel button", () => {
    it("closes the modal without performing the action", async () => {
      const user = userEvent.setup()
      const onSubmit = jest.fn()
      render(
        <Modal trigger={(props) => <button {...props}>trigger</button>}>
          <form>
            <label>
              <input type="checkbox" /> checkbox
            </label>
            <Modal.Action onAction={onSubmit}>submit</Modal.Action>
          </form>
        </Modal>
      )

      await user.click(screen.getByRole("button", { name: "trigger" }))
      await user.click(screen.getByRole("button", { name: "Cancel" }))

      expect(onSubmit).not.toHaveBeenCalled()
      expect(screen.queryByRole("checkbox")).not.toBeInTheDocument()
    })
  })
})
