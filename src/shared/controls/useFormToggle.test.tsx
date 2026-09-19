import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { useFormToggle } from "./useFormToggle"

function ToggledForm() {
  const { isFormOpen, triggerRef, toggleForm, closeForm, closeFormOnEscape } =
    useFormToggle()

  return (
    <>
      <button ref={triggerRef} onClick={toggleForm}>
        Add thing
      </button>
      {isFormOpen && (
        <form aria-label="Add thing" onKeyDown={closeFormOnEscape}>
          <input aria-label="Description" />
          <button type="button" onClick={closeForm}>
            Cancel
          </button>
        </form>
      )}
    </>
  )
}

describe("useFormToggle", () => {
  it("shows the form when the trigger is clicked", async () => {
    const user = userEvent.setup()
    render(<ToggledForm />)

    expect(screen.queryByRole("form")).not.toBeInTheDocument()

    await user.click(screen.getByRole("button", { name: "Add thing" }))

    expect(screen.getByRole("form", { name: "Add thing" })).toBeInTheDocument()
  })

  it("returns focus to the trigger when the form is closed", async () => {
    const user = userEvent.setup()
    render(<ToggledForm />)

    const trigger = screen.getByRole("button", { name: "Add thing" })
    await user.click(trigger)
    await user.click(screen.getByRole("textbox", { name: "Description" }))
    await user.click(screen.getByRole("button", { name: "Cancel" }))

    expect(screen.queryByRole("form")).not.toBeInTheDocument()
    expect(trigger).toHaveFocus()
  })

  it("closes the form and returns focus when escape is pressed", async () => {
    const user = userEvent.setup()
    render(<ToggledForm />)

    const trigger = screen.getByRole("button", { name: "Add thing" })
    await user.click(trigger)
    await user.type(screen.getByRole("textbox", { name: "Description" }), "hi")
    await user.keyboard("{Escape}")

    expect(screen.queryByRole("form")).not.toBeInTheDocument()
    expect(trigger).toHaveFocus()
  })

  it("hides the form and returns focus when the trigger is clicked again", async () => {
    const user = userEvent.setup()
    render(<ToggledForm />)

    const trigger = screen.getByRole("button", { name: "Add thing" })
    await user.click(trigger)
    await user.click(trigger)

    expect(screen.queryByRole("form")).not.toBeInTheDocument()
    expect(trigger).toHaveFocus()
  })
})
