import { render, screen } from "@testing-library/react"
import { CategoryControl, type CategoryControlProps } from "./CategoryControl"
import userEvent from "@testing-library/user-event"

const commonProps: CategoryControlProps = {
  onChange: jest.fn(),
  options: [
    { text: "Chore", emoji: "🧹" },
    { text: "Learning", emoji: "📖" },
  ],
}

describe("CategoryControl", () => {
  describe("when no value is passed in", () => {
    it("shows the dropdown", () => {
      render(<CategoryControl {...commonProps} />)

      expect(screen.getByRole("combobox")).toBeInTheDocument()
    })
  })

  describe("when a value is passed in", () => {
    it("displays that value and hides the emoji input", () => {
      render(
        <CategoryControl
          {...commonProps}
          value={{ text: "Learning", emoji: "📖" }}
        />
      )

      expect(screen.getByRole("combobox")).toBeInTheDocument()
      expect(screen.getAllByText("📖 Learning")).toHaveLength(2) // One for the option & one for the value
      expect(screen.queryByRole("textbox")).not.toBeInTheDocument()
    })
  })

  describe("when the user selects an existing category", () => {
    it("calls on change & keeps the emoji input hidden", async () => {
      const user = userEvent.setup()
      const onChange = jest.fn()
      render(<CategoryControl {...commonProps} onChange={onChange} />)

      await user.click(screen.getByRole("option", { name: "📖 Learning" }))

      expect(onChange).toHaveBeenCalledWith({
        text: "Learning",
        emoji: "📖",
      })
      expect(
        screen.queryByRole("textbox", { name: "emoji" })
      ).not.toBeInTheDocument()
    })
  })

  describe("when the user adds a new category", () => {
    it("shows the category create interface and calls onChange with undefined", async () => {
      const user = userEvent.setup()
      const onChange = jest.fn()
      const { rerender } = render(
        <CategoryControl {...commonProps} onChange={onChange} />
      )

      await user.type(
        screen.getByRole("combobox", { name: "Category" }),
        "Fitness{Enter}"
      )

      expect(onChange).toHaveBeenCalledWith(undefined)

      rerender(
        <CategoryControl
          {...commonProps}
          onChange={onChange}
          value={undefined}
        />
      )

      expect(screen.queryByRole("combobox")).not.toBeInTheDocument()
      expect(screen.getByRole("textbox", { name: "Text" })).toBeInTheDocument()
      expect(screen.getByRole("textbox", { name: "Emoji" })).toBeInTheDocument()
      expect(screen.getByRole("button", { name: "Create" })).toBeInTheDocument()
      expect(screen.getByRole("button", { name: "Cancel" })).toBeInTheDocument()
    })
  })
})
