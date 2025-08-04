import { render, screen } from "@testing-library/react"
import { ConfirmationModal, Props } from "./ConfirmationModal"
import userEvent from "@testing-library/user-event"

const defaultProps: Props = {
  message: "Are you sure?",
  isOpen: true,
  onClose: jest.fn(),
  onConfirm: jest.fn(),
  confirmButtonText: "Delete",
  setOpen: jest.fn(),
  trigger: (triggerProps) => <button {...triggerProps}>delete</button>,
}

describe("ConfirmationModal", () => {
  describe("when isOpen is false", () => {
    it("does not render", () => {
      render(<ConfirmationModal {...defaultProps} isOpen={false} />)

      expect(screen.queryByText(defaultProps.message)).not.toBeInTheDocument()
    })
  })

  describe("when isOpen is true", () => {
    it("shows the confirmation message", () => {
      render(<ConfirmationModal {...defaultProps} isOpen />)

      expect(screen.getByText(defaultProps.message)).toBeInTheDocument()
    })

    describe("when the confirm button is clicked", () => {
      it("calls onConfirm and onClose", async () => {
        const user = userEvent.setup()
        const onConfirm = jest.fn()
        const onClose = jest.fn()
        render(
          <ConfirmationModal
            {...defaultProps}
            onConfirm={onConfirm}
            onClose={onClose}
          />
        )

        await user.click(
          screen.getByRole("button", { name: defaultProps.confirmButtonText })
        )

        expect(onConfirm).toHaveBeenCalled()
        expect(onClose).toHaveBeenCalled()
      })
    })

    describe("when the cancel button is clicked", () => {
      it("calls onClose, but not onConfirm", async () => {
        const user = userEvent.setup()
        const onConfirm = jest.fn()
        const onClose = jest.fn()
        render(
          <ConfirmationModal
            {...defaultProps}
            onConfirm={onConfirm}
            onClose={onClose}
          />
        )

        await user.click(screen.getByRole("button", { name: "Cancel" }))

        expect(onConfirm).not.toHaveBeenCalled()
        expect(onClose).toHaveBeenCalled()
      })
    })
  })
})
