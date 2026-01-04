import { render, screen } from "@testing-library/react"
import { Combobox } from "./Combobox"
import userEvent from "@testing-library/user-event"

const options = [
  { id: "1", label: "apple" },
  { id: "2", label: "orange" },
  { id: "3", label: "grape" },
  { id: "4", label: "grapefruit" },
]

const commonProps = {
  value: undefined,
  options: options,
  onChange: jest.fn(),
  createOption: (label: string) => ({ id: "5", label }),
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

  describe("when the input loses focus", () => {
    it("closes the popover & clears the search term", async () => {
      const user = userEvent.setup()
      render(<Combobox {...commonProps} />)
      const popover = screen.getByTestId("popover")
      jest.spyOn(popover, "showPopover")
      jest.spyOn(popover, "hidePopover")
      const input = screen.getByRole("combobox")

      await user.type(input, " ")
      expect(popover.showPopover).toHaveBeenCalled()
      await user.keyboard("{Tab}")

      expect(popover.hidePopover).toHaveBeenCalled()
      expect(input).toHaveValue("")
    })
  })

  describe("single value combobox", () => {
    describe("when the popover is open", () => {
      describe("and the user presses the arrow keys", () => {
        it("updates the highlighted option, but doesn't update the value until the user presses enter", async () => {
          const user = userEvent.setup()
          const onChange = jest.fn()
          const onKeydown = jest.fn()
          render(<Combobox {...commonProps} onChange={onChange} />, {
            wrapper: ({ children }) => (
              <div onKeyDown={onKeydown}>{children}</div>
            ),
          })
          const input = screen.getByRole("combobox")
          const popover = screen.getByTestId("popover")
          jest.spyOn(popover, "hidePopover")
          await user.type(input, " ") // open popover

          await user.type(input, "{ArrowDown}{ArrowDown}")

          expect(onChange).not.toHaveBeenCalled()

          onKeydown.mockClear()
          await user.type(input, "{Enter}")

          expect(onChange).toHaveBeenCalledWith(options[1])
          expect(onKeydown).not.toHaveBeenCalled()
          expect(popover.hidePopover).toHaveBeenCalled()
        })
      })
    })

    describe("when the user types in the input", () => {
      it("opens the popover, updates the value & filters the options", async () => {
        const user = userEvent.setup()
        const onChange = jest.fn()
        render(<Combobox {...commonProps} onChange={onChange} />)
        const popover = screen.getByTestId("popover")
        jest.spyOn(popover, "showPopover")
        const input = screen.getByRole("combobox")

        await user.type(input, "g")

        expect(popover.showPopover).toHaveBeenCalled()
        expect(onChange).toHaveBeenCalledWith({ id: "5", label: "g" })

        expect(
          screen.queryByRole("option", { name: options[0].label })
        ).not.toBeInTheDocument()

        await user.type(input, "{ArrowDown}{ArrowDown}{Enter}")

        expect(onChange).toHaveBeenCalledWith(options[2])
      })

      describe("and the text matches an existing option label exactly", () => {
        it("updates the value to the existing option", async () => {
          const user = userEvent.setup()
          const onChange = jest.fn()
          render(<Combobox {...commonProps} onChange={onChange} />)
          const input = screen.getByRole("combobox")

          await user.type(input, "grape")

          expect(onChange).toHaveBeenCalledWith({ id: "3", label: "grape" })
        })
      })

      describe("then presses enter", () => {
        it("clears the input and doesn't call onChange again", async () => {
          const user = userEvent.setup()
          const onChange = jest.fn()
          render(<Combobox {...commonProps} onChange={onChange} />)
          const input = screen.getByRole("combobox")

          await user.type(input, "grape")
          onChange.mockClear()
          await user.type(input, "{Enter}")

          expect(onChange).not.toHaveBeenCalled()
          expect(input).toHaveValue("")
        })
      })
    })

    describe("when the user clicks an option", () => {
      it("updates the value, clears the search text & closes the popover", async () => {
        const user = userEvent.setup()
        const onChange = jest.fn()
        render(<Combobox {...commonProps} onChange={onChange} />)
        const popover = screen.getByTestId("popover")
        jest.spyOn(popover, "hidePopover")
        const input = screen.getByRole("combobox")

        await user.type(input, "g")
        await user.click(screen.getByRole("option", { name: "grapefruit" }))

        expect(onChange).toHaveBeenCalledWith(options[3])
        expect(input).toHaveValue("")
        expect(popover.hidePopover).toHaveBeenCalled()
      })
    })
  })

  describe("multi value combobox", () => {
    const multivalueProps = {
      ...commonProps,
      isMultiValue: true,
      value: [options[0]],
    }

    describe("when the popover is open", () => {
      describe("and the user presses the arrow keys", () => {
        it("updates the highlighted option, but doesn't update the value until the user presses enter", async () => {
          const user = userEvent.setup()
          const onChange = jest.fn()
          const onKeydown = jest.fn()
          render(<Combobox {...multivalueProps} onChange={onChange} />, {
            wrapper: ({ children }) => (
              <div onKeyDown={onKeydown}>{children}</div>
            ),
          })
          const input = screen.getByRole("combobox")
          const popover = screen.getByTestId("popover")
          jest.spyOn(popover, "hidePopover")
          await user.type(input, " ") // open popover

          await user.type(input, "{ArrowDown}{ArrowDown}")

          expect(onChange).not.toHaveBeenCalled()

          onKeydown.mockClear()
          await user.type(input, "{Enter}")

          expect(onChange).toHaveBeenCalledWith([options[0], options[1]])
          expect(onKeydown).not.toHaveBeenCalled()
          expect(popover.hidePopover).not.toHaveBeenCalled()
        })
      })
    })

    describe("when the user types in the input", () => {
      it("opens the popover & filters the options, but doesn't update the value until the user presses enter", async () => {
        const user = userEvent.setup()
        const onChange = jest.fn()
        render(<Combobox {...multivalueProps} onChange={onChange} />)
        const popover = screen.getByTestId("popover")
        jest.spyOn(popover, "showPopover")
        const input = screen.getByRole("combobox")

        await user.type(input, "gr")
        expect(popover.showPopover).toHaveBeenCalled()
        expect(onChange).not.toHaveBeenCalled()
        await user.type(input, "{ArrowDown}{Enter}")
        expect(onChange).toHaveBeenCalledWith([options[0], options[2]])
      })

      describe("and the text matches an existing option label exactly", () => {
        it("updates the value to the existing option", async () => {
          const user = userEvent.setup()
          const onChange = jest.fn()
          render(
            <Combobox
              {...multivalueProps}
              value={[options[0]]}
              onChange={onChange}
            />
          )
          const input = screen.getByRole("combobox")

          await user.type(input, "grape{Enter}")

          expect(onChange).toHaveBeenCalledWith([
            options[0],
            { id: "3", label: "grape" },
          ])
        })
      })

      describe("then presses enter", () => {
        it("clears the input and updates the value", async () => {
          const user = userEvent.setup()
          const onChange = jest.fn()
          render(<Combobox {...multivalueProps} onChange={onChange} />)
          const input = screen.getByRole("combobox")

          await user.type(input, "kiwi")
          onChange.mockClear()
          await user.type(input, "{Enter}")

          expect(onChange).toHaveBeenCalledWith([
            options[0],
            { id: "5", label: "kiwi" },
          ])
          expect(input).toHaveValue("")
        })
      })
    })

    describe("when the user clicks an option", () => {
      it("updates the value, clears the search text & keeps the popover open", async () => {
        const user = userEvent.setup()
        const onChange = jest.fn()
        render(<Combobox {...multivalueProps} onChange={onChange} />)
        const popover = screen.getByTestId("popover")
        jest.spyOn(popover, "hidePopover")
        const input = screen.getByRole("combobox")

        await user.type(input, "g")
        await user.click(screen.getByRole("option", { name: "grapefruit" }))

        expect(onChange).toHaveBeenCalledWith([options[0], options[3]])
        expect(input).toHaveValue("")
        expect(popover.hidePopover).toHaveBeenCalled()
      })
    })
  })

  // multi value
  // correctly select initial values
  // when clicking already selected option, unselect it
  // when the user types something that's already a selected value, it doesn't add it to the value
  // remove item & remove all

  // remove elements from the list?
  // highlight previously selected element
  // when the list of options changes, maintain the highlighted element if possible
  // when the currently highlighted element is removed from the list, nothing is highlighted
  // when the user presses enter without typing/selecting anything, the event bubbles

  // debounce the input
})
