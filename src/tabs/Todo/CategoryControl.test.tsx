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
        colour: "blue",
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
      expect(screen.getByLabelText("Colour")).toBeInTheDocument()
      expect(screen.getByRole("button", { name: "Create" })).toBeInTheDocument()
      expect(screen.getByRole("button", { name: "Cancel" })).toBeInTheDocument()
    })

    describe("and presses enter without adding an emoji", () => {
      it("shows an error message", async () => {
        const user = userEvent.setup()
        render(<CategoryControl {...commonProps} value={undefined} />)

        await user.type(screen.getByRole("combobox"), "exercise{Enter}{Enter}")

        expect(screen.getByText("icon required")).toBeInTheDocument()
      })
    })

    // when the user enters an emoji & presses enter, it creates a new category with the default colour
    // when the user picks a colour & presses enter, it shows an error message
    // when the user enters an emoji & picks a colour & presses enter, it creates a new category with the selected colour
    // should probably also have ok & cancel buttons

    // describe("when the user types a new category and presses enter", () => {
    // it("show the emoji input & calls onChange with undefined", async () => {
    //   const user = userEvent.setup()
    //   const onChange = jest.fn()
    //   const { rerender } = render(
    //     <CategoryControl {...commonProps} onChange={onChange} />
    //   )

    //   await user.type(
    //     screen.getByRole("combobox", { name: "Category" }),
    //     "Fitness{Enter}"
    //   )

    //   expect(onChange).toHaveBeenCalledWith(undefined)

    //   rerender(
    //     <CategoryControl
    //       {...commonProps}
    //       onChange={onChange}
    //       value={undefined}
    //     />
    //   )
    //   expect(screen.getByRole("textbox", { name: "Emoji" })).toBeInTheDocument()
    // })

    // describe("when the user adds an emoji", () => {
    //   it("calls onChange with the new category", async () => {
    //     const user = userEvent.setup()
    //     const onChange = jest.fn()
    //     render(<CategoryControl {...commonProps} onChange={onChange} />)

    //     await user.type(
    //       screen.getByRole("combobox", { name: "Category" }),
    //       "Fitness{Enter}"
    //     )
    //     await user.type(screen.getByRole("textbox", { name: "Emoji" }), "🏃‍♀️")

    //     // emoji doesn't render properly in test for some reason
    //     expect(onChange).toHaveBeenCalledWith({
    //       text: "Fitness",
    //       emoji: expect.any(String),
    //     })
    //   })
    // })
  })
})
