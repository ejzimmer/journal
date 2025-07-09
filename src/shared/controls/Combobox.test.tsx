import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { Combobox } from "./Combobox"

HTMLElement.prototype.showPopover = jest.fn()

const defaultProps = {
  options: [
    { id: "leela", label: "Leela", colour: "purple" },
    { id: "bender", label: "Bender", colour: "silver" },
    { id: "fry", label: "Fry", colour: "orange" },
    { id: "zoidberg", label: "Zoidberg", colour: "pink" },
  ],
}

describe("Combobox", () => {
  describe("mouse interactions", () => {
    it("can select an option from the list", async () => {
      const user = userEvent.setup()
      render(<Combobox {...defaultProps} />)

      await user.click(screen.getByRole("textbox"))
      const benderOption = screen.getByRole("option", { name: "Bender" })
      await user.click(benderOption)

      expect(benderOption).toHaveAttribute("aria-selected", "true")
      expect(
        screen.getByRole("button", { name: "Bender, remove" })
      ).toBeInTheDocument()
    })
  })

  describe("keyboard interactions", () => {
    it("can select an option from the list", async () => {
      const user = userEvent.setup()
      render(<Combobox {...defaultProps} />)

      await user.keyboard("{Tab}")
      const leelaOption = screen.getByRole("option", { name: "Bender" })

      await user.keyboard("{ArrowDown}{ArrowDown}")
      await user.keyboard(" ")

      expect(leelaOption).toHaveAttribute("aria-selected", "true")
    })

    it("wraps around the list when navigating via arrows", async () => {
      const user = userEvent.setup()
      render(<Combobox {...defaultProps} />)

      const lastOption = screen.getByRole("option", {
        name: defaultProps.options.at(-1)?.label,
      })
      const firstOption = screen.getByRole("option", {
        name: defaultProps.options.at(0)?.label,
      })

      await user.keyboard("{Tab}")

      await user.keyboard("{ArrowUp} ")
      expect(lastOption).toHaveAttribute("aria-selected", "true")

      await user.keyboard("{ArrowDown} ")
      expect(firstOption).toHaveAttribute("aria-selected", "true")

      await user.keyboard("{ArrowUp} ")
      expect(lastOption).toHaveAttribute("aria-selected", "false")
    })
  })

  describe("when the user types in the input", () => {
    it("filters the list of options", () => {})
  })

  // types to filter options in the list
  // type to create a new option
  // displays selected options
  // works with a keyboard
  // open popup on focus, close on blur
  // can handle arbitrary options & selected lozenges
})
