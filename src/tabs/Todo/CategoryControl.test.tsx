import { render, screen } from "@testing-library/react"
import { CategoryControl, type CategoryControlProps } from "./CategoryControl"
import userEvent from "@testing-library/user-event"
import { CategoriesContext } from "."
import { ReactNode } from "react"

const commonProps: CategoryControlProps = {
  onChange: jest.fn(),
}

const categories = [
  { text: "chore", emoji: "🧹" },
  { text: "learning", emoji: "📖" },
]

function Wrapper({ children }: { children: ReactNode }) {
  return (
    <CategoriesContext.Provider value={categories}>
      {children}
    </CategoriesContext.Provider>
  )
}

describe("CategoryControl", () => {
  it("shows the combobox input + emoji input, options show emoji + description", () => {
    render(<CategoryControl {...commonProps} />, { wrapper: Wrapper })

    expect(screen.getByRole("combobox")).toBeInTheDocument()
    expect(screen.getByRole("textbox")).toBeInTheDocument()
    categories.forEach((category) => {
      expect(
        screen.getByRole("option", {
          name: `${category.emoji} ${category.text}`,
        })
      ).toBeInTheDocument()
    })
  })

  describe("when the user selects an option", () => {
    it("calls the onchange handler", async () => {
      const user = userEvent.setup()
      const onChange = jest.fn()
      render(<CategoryControl {...commonProps} onChange={onChange} />, {
        wrapper: Wrapper,
      })

      await user.keyboard("{Tab}{ArrowDown}")

      expect(onChange).toHaveBeenCalledWith(categories[0])
    })
  })

  describe("when the value has an emoji", () => {
    it("shows the label in the combobox and the emoji in the textbox", () => {
      render(<CategoryControl {...commonProps} value={categories[0]} />, {
        wrapper: Wrapper,
      })

      expect(screen.getAllByText(new RegExp(categories[0].text))).toHaveLength(
        2
      )
      expect(screen.getByRole("textbox")).toHaveValue(categories[0].emoji)
    })
  })

  describe("when the value has no emoji", () => {
    it("shows the label in the combobox and empty string in the textbox", () => {
      render(
        <CategoryControl
          {...commonProps}
          value={{ text: "Exercise", emoji: "" }}
        />,
        { wrapper: Wrapper }
      )

      expect(
        screen.getByText(new RegExp(categories[0].text))
      ).toBeInTheDocument()
      expect(screen.getByRole("textbox")).toHaveValue("")
    })
  })

  describe("when the user updates the emoji", () => {
    it("calls the onChange handler", async () => {
      const user = userEvent.setup()
      const onChange = jest.fn()
      render(
        <CategoryControl
          {...commonProps}
          value={{ text: "Exercise", emoji: "" }}
          onChange={onChange}
        />,
        { wrapper: Wrapper }
      )

      await user.type(screen.getByRole("textbox"), "x")

      expect(onChange).toHaveBeenCalledWith({ text: "Exercise", emoji: "x" })
    })
  })
})
