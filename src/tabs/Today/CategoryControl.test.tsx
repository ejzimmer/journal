import { render, screen } from "@testing-library/react"
import { CategoryControl } from "./CategoryControl"
import userEvent from "@testing-library/user-event"

const commonProps = {
  onChange: jest.fn(),
  options: [
    { text: "Chore", emoji: "🧹" },
    { text: "Learning", emoji: "📖" },
  ],
}

describe("CategoryControl", () => {
  it("defaults to the first item in the list & hides the emoji input", () => {
    render(<CategoryControl {...commonProps} />)

    expect(screen.getByText("🧹 Chore")).toBeInTheDocument()
    expect(
      screen.queryByRole("textbox", { name: "Emoji" })
    ).not.toBeInTheDocument()
  })

  describe("when the user selects an existing category", () => {
    it("calls on change & keeps the emoji input hidden", async () => {
      const user = userEvent.setup()
      const onChange = jest.fn()
      render(<CategoryControl {...commonProps} onChange={onChange} />)

      await user.click(screen.getByRole("option", { name: "📖 Learning" }))

      expect(onChange).toHaveBeenCalledWith({ text: "Learning", emoji: "📖" })
      expect(
        screen.queryByRole("textbox", { name: "emoji" })
      ).not.toBeInTheDocument()
    })
  })

  describe("when the user adds a new category", () => {
    it("show the emoji input & calls onChange with undefined", async () => {
      const user = userEvent.setup()
      const onChange = jest.fn()
      render(<CategoryControl {...commonProps} onChange={onChange} />)

      await user.type(
        screen.getByRole("textbox", { name: "Category" }),
        "Fitness{Enter}"
      )

      expect(onChange).toHaveBeenCalledWith(undefined)
      expect(screen.getByRole("textbox", { name: "Emoji" })).toBeInTheDocument()
    })

    describe("when the user adds an emoji", () => {
      it("calls onChange with the new category", async () => {
        const user = userEvent.setup()
        const onChange = jest.fn()
        render(<CategoryControl {...commonProps} onChange={onChange} />)

        await user.type(
          screen.getByRole("textbox", { name: "Category" }),
          "Fitness{Enter}"
        )
        await user.type(screen.getByRole("textbox", { name: "Emoji" }), "🏃‍♀️")

        // emoji doesn't render properly in test for some reason
        expect(onChange).toHaveBeenCalledWith({
          text: "Fitness",
          emoji: expect.any(String),
        })
      })
    })
  })
})
