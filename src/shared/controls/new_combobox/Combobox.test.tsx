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
  describe("when the value is undefined", () => {
    it("is closed, with no value showing", () => {
      render(<Combobox {...commonProps} />)
      const popover = screen.getByTestId("popover")
      jest.spyOn(popover, "showPopover")

      expect(screen.getByRole("combobox")).toHaveValue("")
      expect(popover.showPopover).not.toHaveBeenCalled()
    })
  })

  describe("when the popout is closed", () => {
    describe("and the user presses space", () => {
      it("opens the popout", async () => {
        const user = userEvent.setup()
        render(<Combobox {...commonProps} value={options[0]} />)
        const popover = screen.getByTestId("popover")
        jest.spyOn(popover, "showPopover")

        await user.type(screen.getByRole("combobox"), " ")

        expect(popover.showPopover).toHaveBeenCalled()
      })
    })

    describe("and the user clicks the input", () => {
      it("opens the popout", async () => {
        const user = userEvent.setup()
        render(<Combobox {...commonProps} value={options[0]} />)
        const popover = screen.getByTestId("popover")
        jest.spyOn(popover, "showPopover")

        await user.click(screen.getByRole("combobox"))

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

  it("supports custom options", () => {
    render(
      <Combobox
        {...commonProps}
        Option={({ value }) => <div>custom: {value.label}</div>}
      />
    )

    options.forEach((option) => {
      expect(
        screen.getByRole("option", { name: `custom: ${option.label}` })
      ).toBeInTheDocument()
    })
  })

  it("supports custom value", () => {
    const value = options[2]
    render(
      <Combobox
        {...commonProps}
        value={value}
        Value={({ value }) => <div>custom: {value?.label}</div>}
      />
    )
    expect(screen.getByText(`custom: ${value.label}`)).toBeInTheDocument()
  })

  describe("single value combobox", () => {
    it("shows the selected option", () => {
      const value = options[2]
      render(<Combobox {...commonProps} value={value} />)

      // One for the value & one in the options
      expect(screen.getAllByText(value.label)).toHaveLength(2)

      options.forEach((option) => {
        expect(
          screen.getByRole("option", { name: option.label })
        ).toHaveAttribute("aria-selected", option === value ? "true" : "false")
      })
    })

    describe("when the popover is closed", () => {
      describe("and the user presses the arrow keys", () => {
        it("updates the value", async () => {
          const user = userEvent.setup({ skipClick: true })
          const onChange = jest.fn()
          const { rerender } = render(
            <Combobox {...commonProps} onChange={onChange} />
          )
          const popover = screen.getByTestId("popover")
          jest.spyOn(popover, "showPopover")
          const input = screen.getByRole("combobox")

          await user.tab()
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
    })

    describe("when the popover is open", () => {
      describe("and the user presses the arrow keys", () => {
        it("updates the highlighted option, but doesn't update the value until the user presses enter", async () => {
          const user = userEvent.setup({ skipClick: true })
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
          await user.tab()
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

    describe("when hideSelectedOptions is true", () => {
      it("does not show selected options in the dropdown", async () => {
        const user = userEvent.setup()
        render(
          <Combobox {...commonProps} value={options[2]} hideSelectedOptions />
        )
        await user.type(screen.getByRole("combobox"), "{ArrowDown}")

        expect(
          screen.queryByRole("option", { name: options[2].label })
        ).not.toBeInTheDocument()
      })
    })
  })

  describe("multi value combobox", () => {
    const multivalueProps = {
      ...commonProps,
      isMultiValue: true,
      value: [options[0]],
    }

    it("marks the selected options", () => {
      const value = [options[0], options[3]]
      render(<Combobox {...multivalueProps} value={value} />)

      options.forEach((option) => {
        expect(
          screen.getByRole("option", { name: option.label })
        ).toHaveAttribute(
          "aria-selected",
          value.includes(option) ? "true" : "false"
        )
      })
    })

    describe("when the popover is closed", () => {
      describe("and the user presses an arrow key", () => {
        it("opens the popover & highlights the option but doesn't update the value until the user presses enter", async () => {
          const user = userEvent.setup()
          const onChange = jest.fn()
          render(<Combobox {...multivalueProps} onChange={onChange} />)
          const popover = screen.getByTestId("popover")
          jest.spyOn(popover, "showPopover")
          const input = screen.getByRole("combobox")

          await user.type(input, "{ArrowUp}")

          expect(popover.showPopover).toHaveBeenCalled()
          expect(onChange).not.toHaveBeenCalled()

          await user.type(input, "{Enter}")

          expect(onChange).toHaveBeenCalledWith([options[0], options[3]])
        })
      })
    })

    describe("when the popover is open", () => {
      describe("and the user presses the arrow keys", () => {
        it("updates the highlighted option, but doesn't update the value until the user presses enter", async () => {
          const user = userEvent.setup({ skipClick: true })
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
          await user.tab()
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
      })
    })

    describe("when the user deselects an option", () => {
      it("updates the value", async () => {
        const user = userEvent.setup()
        const onChange = jest.fn()
        render(<Combobox {...multivalueProps} onChange={onChange} />)
        const input = screen.getByRole("combobox")

        await user.type(input, "ap")
        await user.click(screen.getByRole("option", { name: options[0].label }))

        expect(onChange).toHaveBeenCalledWith([])
        expect(input).toHaveValue("")
      })
    })

    describe("when the user tries to add an option that's already selected", () => {
      it("doesn't change the value & clears the input", async () => {
        const user = userEvent.setup()
        const onChange = jest.fn()
        render(<Combobox {...multivalueProps} onChange={onChange} />)
        const input = screen.getByRole("combobox")

        await user.type(input, "apple{Enter}")

        expect(onChange).not.toHaveBeenCalled()
        expect(input).toHaveValue("")
      })
    })

    describe("when the user clicks the remove button on a selected option", () => {
      it("removes the option", async () => {
        const user = userEvent.setup()
        const onChange = jest.fn()
        render(<Combobox {...multivalueProps} onChange={onChange} />)

        await user.click(
          screen.getByRole("button", { name: `Remove ${options[0].label}` })
        )

        expect(onChange).toHaveBeenCalledWith([])
      })
    })

    describe("when the user clicks the remove all button", () => {
      it("removes all selected options", async () => {
        const user = userEvent.setup()
        const onChange = jest.fn()
        render(
          <Combobox {...multivalueProps} value={options} onChange={onChange} />
        )

        await user.click(screen.getByRole("button", { name: "Remove all" }))

        expect(onChange).toHaveBeenCalledWith([])
      })
    })

    describe("when hideSelectedOptions is true", () => {
      it("does not show selected options in the dropdown", async () => {
        const user = userEvent.setup()
        render(
          <Combobox
            {...multivalueProps}
            value={[options[2], options[3]]}
            hideSelectedOptions
          />
        )
        await user.type(screen.getByRole("combobox"), "{ArrowDown}")

        expect(
          screen.queryByRole("option", { name: options[2].label })
        ).not.toBeInTheDocument()
        expect(
          screen.queryByRole("option", { name: options[3].label })
        ).not.toBeInTheDocument()
      })
    })
  })

  describe("when the list is filtered", () => {
    describe("and the currently highlighted option is still in the list", () => {
      it("stay highlighted", async () => {
        const user = userEvent.setup()
        const onChange = jest.fn()
        render(<Combobox {...commonProps} onChange={onChange} />)
        const input = screen.getByRole("combobox")

        // Orange is highlighted
        await user.type(input, "{ArrowDown}{ArrowDown}")
        await user.type(input, "g")

        expect(screen.getAllByRole("option")).toHaveLength(3)
        await user.type(input, "{Enter}")

        expect(onChange).toHaveBeenCalledWith(options[1])
      })
    })

    describe("and the currently highlighted option is no longer in the list", () => {
      it("stay highlighted", async () => {
        const user = userEvent.setup()
        const onChange = jest.fn()
        render(<Combobox {...commonProps} onChange={onChange} />)
        const input = screen.getByRole("combobox")

        // Orange is highlighted
        await user.type(input, "{ArrowDown}{ArrowDown}")
        await user.type(input, "gr")

        expect(screen.getAllByRole("option")).toHaveLength(2)
        onChange.mockClear()
        await user.type(input, "{Enter}")

        expect(onChange).not.toHaveBeenCalled()
      })
    })
  })
})
