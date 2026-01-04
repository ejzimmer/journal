import { render, screen } from "@testing-library/react"
import { Combobox } from "./Combobox"
import userEvent from "@testing-library/user-event"

const options = [
  { id: "1", label: "alpha" },
  { id: "2", label: "beta" },
  { id: "3", label: "gamma" },
  { id: "4", label: "delta" },
]

const commonProps = {
  value: undefined,
  options: options,
  onChange: jest.fn(),
}

describe("Combobox", () => {
  describe("when the value is undefind", () => {
    it("is closed, with no value showing", () => {
      render(<Combobox {...commonProps} />)
      const popover = screen.getByTestId("popover")
      jest.spyOn(popover, "showPopover")

      expect(screen.getByRole("combobox")).toHaveValue("")
      expect(popover.showPopover).not.toHaveBeenCalled()
    })
  })

  describe("when the popout is closed", () => {
    describe("and the user presses the arrow keys", () => {
      it("updates the value", async () => {
        const user = userEvent.setup()
        const onChange = jest.fn()
        const { rerender } = render(
          <Combobox {...commonProps} onChange={onChange} />
        )
        const popover = screen.getByTestId("popover")
        jest.spyOn(popover, "showPopover")
        const input = screen.getByRole("combobox")

        await user.type(input, "{ArrowDown}")

        expect(onChange).toHaveBeenCalledWith(options[0])
        expect(popover.showPopover).not.toHaveBeenCalled()

        rerender(
          <Combobox {...commonProps} value={options[0]} onChange={onChange} />
        )
        await user.type(input, "{ArrowUp}")

        expect(onChange).toHaveBeenCalledWith(options.at(-1))
      })
    })

    describe("and the user presses space", () => {
      it("opens the popout", async () => {
        const user = userEvent.setup()
        render(<Combobox {...commonProps} />)
        const popover = screen.getByTestId("popover")
        jest.spyOn(popover, "showPopover")

        await user.type(screen.getByRole("combobox"), " ")

        expect(popover.showPopover).toHaveBeenCalled()
      })
    })
  })

  describe("when the popout is open", () => {
    describe("single value combobox", () => {
      describe("when the user presses the arrow keys", () => {
        it("updates the highlighted option, but doesn't update the value", async () => {
          const user = userEvent.setup()
          const onChange = jest.fn()
          const onKeydown = jest.fn()
          render(<Combobox {...commonProps} onChange={onChange} />, {
            wrapper: ({ children }) => (
              <div onKeyDown={onKeydown}>{children}</div>
            ),
          })
          const input = screen.getByRole("combobox")
          await user.type(input, " ") // open popover

          await user.type(input, "{ArrowDown}{ArrowDown}")

          expect(onChange).not.toHaveBeenCalled()

          onKeydown.mockClear()
          await user.type(input, "{Enter}")

          expect(onChange).toHaveBeenCalledWith(options[1])
          expect(onKeydown).not.toHaveBeenCalled()
        })
      })
    })
  })
  // single value
  // when the user types, the popout is open, the value is updated & the options are filtered
  // when there's text in the input & it matches a current option, the value is updated to the current option
  // when there's text in the input & it doesn't match a current option & no value is highlighted & the user presses enter, it doesn't update the value again, but it clears the input & closes the popover
  // when there's text in the input & a value is highlighted & the user presses enter, the value is updated to the highlighted option & the input is cleared & the popover closes
  // when the input is blurred, the popout closes
  // when the popout is open & the value is set to undefined, the popout closes
  // when an option is selected, the popout closes
  // when the user clicks an option with the mouse, it updates the value, clears the input & closes the popover
  // when the user types something that's the same as an existing option, it updates the value using the existing option, clears the input & closes the popover

  // multi value
  // same as single value except
  // arrow key on its own deselects all unhighlighted elements, selects newly highlighted element
  // ctrl + arrow key to navigate without selecting, ctrl + space to select non-contiguous elements
  // shift + arrow key to select multiple contiguous elements
  // enter key does the same as arrow key
  // when the user types something that's the same as an existing option, it adds the existing option to the value, clears the input & keeps the popover open
  // when the user types something that's already a selected value, it doesn't add it to the value
  // when an option is selected, the popout doesn't close
  // remove item & remove all
  // when the user clicks an option with the mouse, it updates the value, clears the input & keeps the popover open

  // remove elements from the list?
  // highlight previously selected element
  // when the list of options changes, maintain the highlighted element if possible
  // when the currently highlighted element is removed from the list, nothing is highlighted
  // when the user presses enter without typing/selecting anything, the event bubbles
})
