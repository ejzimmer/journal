import { render, screen } from "@testing-library/react"
import { EditableDescription } from "./EditableDescription"
import userEvent from "@testing-library/user-event"
import { CategoriesContext } from "../../tabs/Todo"
import { ReactNode } from "react"

const commonProps = {
  category: "🪥",
  description: "Brush teeth",
  isChecked: true,
  onChange: jest.fn(),
}

function Wrapper({ children }: { children: ReactNode }) {
  return (
    <CategoriesContext.Provider value={["🪥", "🧹"]}>
      {children}
    </CategoriesContext.Provider>
  )
}

const expectToBeInViewMode = () => {
  expect(
    screen.getByRole("checkbox", { name: "Brush teeth done" }),
  ).toBeInTheDocument()
  expect(screen.getByText("Brush teeth")).toBeInTheDocument()
  expect(screen.queryByRole("combobox")).not.toBeInTheDocument()
  expect(screen.queryByRole("textbox")).not.toBeInTheDocument()
}

const expectToBeInEditMode = () => {
  expect(screen.queryByRole("checkbox")).not.toBeInTheDocument()
  expect(screen.getByRole("combobox", { name: "Category" })).toBeInTheDocument()
  expect(
    screen.getByRole("textbox", { name: "Description" }),
  ).toBeInTheDocument()
}

describe("EditableDescription", () => {
  it("displays an emoji checkbox and some text", () => {
    render(<EditableDescription {...commonProps} />, { wrapper: Wrapper })

    expect(screen.getByText("🪥")).toBeInTheDocument()
    expect(
      screen.getByRole("checkbox", { name: "Brush teeth done" }),
    ).toBeChecked()
    expectToBeInViewMode()
  })

  describe("when the user clicks the emoji checkbox", () => {
    it("calls the onChange handler", async () => {
      const user = userEvent.setup()
      const onChange = jest.fn()
      render(<EditableDescription {...commonProps} onChange={onChange} />, {
        wrapper: Wrapper,
      })

      await user.click(screen.getByRole("checkbox"))

      expect(onChange).toHaveBeenCalledWith({ isChecked: false })
    })
  })

  describe("when the user clicks the description text", () => {
    it("switches to edit mode", async () => {
      const user = userEvent.setup()
      render(<EditableDescription {...commonProps} />, { wrapper: Wrapper })

      await user.click(screen.getByText("Brush teeth"))

      expectToBeInEditMode()
      const textInput = screen.getByRole("textbox", { name: "Description" })
      expect(textInput).toHaveValue("Brush teeth")
      expect(textInput).toHaveFocus()
    })
  })

  describe("when the user tabs to the description text", () => {
    it("switches to edit mode", async () => {
      const user = userEvent.setup()
      render(<EditableDescription {...commonProps} />, { wrapper: Wrapper })

      await user.tab()
      await user.tab()

      expectToBeInEditMode()
      const textInput = screen.getByRole("textbox", { name: "Description" })
      expect(textInput).toHaveValue("Brush teeth")
      expect(textInput).toHaveFocus()
    })
  })

  describe("in edit mode", () => {
    describe("when the user selects a new category", () => {
      it("calls on change and switches back to view mode", async () => {
        const user = userEvent.setup()
        const onChange = jest.fn()
        render(<EditableDescription {...commonProps} onChange={onChange} />, {
          wrapper: Wrapper,
        })
        await user.click(screen.getByText("Brush teeth"))

        await user.click(screen.getByRole("option", { name: "🧹" }))

        expect(onChange).toHaveBeenCalledWith({ category: "🧹" })
        expectToBeInViewMode()
      })
    })

    describe("when the user updates the description", () => {
      describe("then presses Enter", () => {
        it("calls on change and switches back to view mode", async () => {
          const user = userEvent.setup()
          const onChange = jest.fn()
          render(<EditableDescription {...commonProps} onChange={onChange} />, {
            wrapper: Wrapper,
          })
          await user.click(screen.getByText("Brush teeth"))

          const input = screen.getByRole("textbox", { name: "Description" })
          await user.clear(input)
          await user.type(input, "Floss teeth{Enter}")

          expect(onChange).toHaveBeenCalledWith({ description: "Floss teeth" })
          expectToBeInViewMode()
        })
      })

      describe("then presses Escape", () => {
        it("switches back to view mode without calling onChange", async () => {
          const user = userEvent.setup()
          const onChange = jest.fn()
          render(<EditableDescription {...commonProps} onChange={onChange} />, {
            wrapper: Wrapper,
          })
          await user.click(screen.getByText("Brush teeth"))

          const input = screen.getByRole("textbox", { name: "Description" })
          await user.clear(input)
          await user.type(input, "Floss teeth{Escape}")

          expect(onChange).not.toHaveBeenCalled()
          expectToBeInViewMode()
        })
      })
    })

    describe("when the user doesn't update the description", () => {
      describe("then presses Enter", () => {
        it("switches back to view mode without calling onChange", async () => {
          const user = userEvent.setup()
          const onChange = jest.fn()
          render(<EditableDescription {...commonProps} onChange={onChange} />, {
            wrapper: Wrapper,
          })
          await user.click(screen.getByText("Brush teeth"))

          await user.keyboard("{Enter}")

          expect(onChange).not.toHaveBeenCalled()
          expectToBeInViewMode()
        })
      })
    })
  })
})
