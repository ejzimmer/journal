import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { AddTaskForm } from "./AddTaskForm"

const commonProps = {
  onSubmit: jest.fn(),
}

describe("AddTaskForm", () => {
  it("can open & add a new task", async () => {
    const user = userEvent.setup()
    const onSubmit = jest.fn()
    render(<AddTaskForm onSubmit={onSubmit} />)

    await user.click(screen.getByRole("button", { name: "show add task form" }))
    const type = screen.getByRole("combobox", { name: "task type" })
    const description = screen.getByRole("textbox", {
      name: "task description",
    })
    await user.selectOptions(type, "📓")
    await user.type(description, "Anki")
    await user.keyboard("{Enter}")

    expect(onSubmit).toHaveBeenCalledWith({ description: "Anki", type: "📓" })
    expect(description).toHaveValue("")
    expect(type).toHaveValue("🧹")
  })

  describe("when the user clicks the close button", () => {
    it("closes the form", async () => {
      const user = userEvent.setup()
      render(<AddTaskForm {...commonProps} />)

      expect(screen.queryByRole("textbox")).not.toBeInTheDocument()

      const showFormButton = screen.getByRole("button", {
        name: "show add task form",
      })
      await user.click(showFormButton)
      expect(showFormButton).toHaveTextContent("hide add task form")
      expect(showFormButton).toHaveAttribute("aria-expanded", "true")
      expect(screen.getByRole("textbox")).toBeInTheDocument()

      await user.click(showFormButton)
      expect(showFormButton).toHaveTextContent("show add task form")
      expect(showFormButton).toHaveAttribute("aria-expanded", "false")
      expect(screen.queryByRole("textbox")).not.toBeInTheDocument()
    })
  })
  describe("when the user moves focus away", () => {
    it("closes the form", async () => {
      const user = userEvent.setup()
      const { container } = render(<AddTaskForm {...commonProps} />)

      const showFormButton = screen.getByRole("button", {
        name: "show add task form",
      })
      await user.click(showFormButton)
      expect(showFormButton).toHaveAttribute("aria-expanded", "true")

      await user.click(container)
      expect(showFormButton).toHaveAttribute("aria-expanded", "false")
    })
  })

  // no description, do nothing
  // actually test that the form is shown/hidden
})
