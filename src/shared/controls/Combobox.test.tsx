import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { Combobox, ComboboxProps } from "./Combobox"

type MockOption = {
  text: string
  colour: string
}

const mockOptions: MockOption[] = [
  { text: "a11y", colour: "blue" },
  { text: "i18n", colour: "yellow" },
  { text: "dev prod", colour: "purple" },
  { text: "feature flag", colour: "green" },
  { text: "PR", colour: "orange" },
]

const mockValues: MockOption[] = [mockOptions[0], mockOptions[1]]

const commonProps: ComboboxProps<MockOption> = {
  value: undefined,
  onChange: jest.fn(),
  label: "Things",
  options: mockOptions,
  createOption: (text: string) => ({ text, colour: "orange" }),
}

describe("Combobox", () => {
  describe("when multiselect is true", () => {
    const multiCommonProps: ComboboxProps<MockOption> = {
      ...commonProps,
      allowMulti: true,
      value: mockValues,
      onChange: jest.fn(),
    }
    describe("When the user types a brand new option and presses enter", () => {
      it("Adds a new tag & clears the input", async () => {
        const user = userEvent.setup()
        const onChange = jest.fn()
        const { rerender } = render(
          <Combobox {...multiCommonProps} onChange={onChange} />
        )

        const input = screen.getByRole("textbox")
        await user.type(input, "data decoration{Enter}")

        expect(onChange).toHaveBeenCalledTimes(1)
        expect(onChange).toHaveBeenCalledWith([
          ...mockValues,
          { text: "data decoration", colour: "orange" },
        ])
        expect(input).toHaveValue("")

        rerender(
          <Combobox
            {...multiCommonProps}
            onChange={onChange}
            value={[
              ...mockValues,
              { text: "data decoration", colour: "orange" },
            ]}
          />
        )

        expect(
          screen.getByRole("button", { name: "Remove data decoration" })
        ).toBeInTheDocument()

        await user.type(input, "allow null values{Enter}")

        expect(onChange).toHaveBeenCalledWith([
          ...mockValues,
          { text: "data decoration", colour: "orange" },
          { text: "allow null values", colour: "orange" },
        ])
      })
    })

    describe("when the user clicks remove <label name>", () => {
      it("removes the label", async () => {
        const user = userEvent.setup()
        const onChange = jest.fn()
        render(<Combobox {...multiCommonProps} onChange={onChange} />)

        await user.click(screen.getByRole("button", { name: "Remove a11y" }))

        expect(onChange).toHaveBeenCalledWith([mockValues[1]])
      })
    })

    describe("when the user clicks clear all", () => {
      it("removes all the labels and any text in the input", async () => {
        const user = userEvent.setup()
        const onChange = jest.fn()
        render(<Combobox {...multiCommonProps} onChange={onChange} />)

        const input = screen.getByRole("textbox")
        await user.type(input, "dev prod")

        await user.click(screen.getByRole("button", { name: "Clear all" }))

        expect(onChange).toHaveBeenCalledWith([])
        expect(input).toHaveValue("")
      })

      describe("when the user types an option that has already been selected and presses enter", () => {
        it("doesn't change the value", async () => {
          const user = userEvent.setup()
          const onChange = jest.fn()
          render(<Combobox {...multiCommonProps} onChange={onChange} />)

          const input = screen.getByRole("textbox")
          await user.type(input, mockValues[0].text)
          await user.type(input, "{Enter}")

          expect(onChange).not.toHaveBeenCalled()
          expect(input).toHaveValue("")
        })
      })
    })

    describe("when the user clicks an option with the mouse", () => {
      it("adds that option to the selected options", async () => {
        const user = userEvent.setup()
        const onChange = jest.fn()
        render(<Combobox {...multiCommonProps} onChange={onChange} />)

        const input = screen.getByRole("textbox")
        await user.type(input, "dev")
        await user.click(screen.getByRole("option", { name: "dev prod" }))

        expect(onChange).toHaveBeenCalledWith([
          ...mockValues,
          expect.objectContaining({ text: "dev prod" }),
        ])
        expect(input).toHaveValue("")
      })
    })

    describe("when some options are already selected", () => {
      it("doesn't show those options in the list", async () => {
        const onChange = jest.fn()
        render(<Combobox {...multiCommonProps} onChange={onChange} />)

        const options = screen.getAllByRole("option")
        expect(options).toHaveLength(mockOptions.length - mockValues.length)
        options.forEach((option) => {
          expect(option).not.toHaveTextContent(mockValues[0].text)
          expect(option).not.toHaveTextContent(mockValues[1].text)
        })
      })
    })

    describe("when the user types a tag that's in the list of options and presses enter", () => {
      it("updates the value, using the value in the list of options", async () => {
        const user = userEvent.setup()
        const onChange = jest.fn()
        render(<Combobox {...multiCommonProps} onChange={onChange} />)

        const input = screen.getByRole("textbox")
        const selectedOption = mockOptions[4]
        await user.type(input, selectedOption.text)
        await user.type(input, "{Enter}")

        expect(onChange).toHaveBeenCalledWith([...mockValues, selectedOption])
      })
    })
  })

  describe("when multiselect is false", () => {
    it("hides the clear all button", () => {
      const onChange = jest.fn()
      render(<Combobox {...commonProps} onChange={onChange} />)

      expect(
        screen.queryByRole("button", { name: "Clear all" })
      ).not.toBeInTheDocument()
    })

    describe("When the user types a brand new option and presses enter", () => {
      it("Sets the value & clears the input", async () => {
        const user = userEvent.setup()
        const onChange = jest.fn()
        const { rerender } = render(
          <Combobox {...commonProps} onChange={onChange} />
        )

        const input = screen.getByRole("textbox")
        await user.type(input, "data decoration{Enter}")

        expect(onChange).toHaveBeenCalledTimes(1)
        expect(onChange).toHaveBeenCalledWith({
          text: "data decoration",
          colour: "orange",
        })
        expect(input).toHaveValue("")

        rerender(
          <Combobox
            {...commonProps}
            onChange={onChange}
            value={{ text: "data decoration", colour: "orange" }}
          />
        )

        expect(
          screen.queryByRole("button", { name: "Remove data decoration" })
        ).not.toBeInTheDocument()

        await user.type(input, "support null values{Enter}")

        expect(onChange).toHaveBeenCalledWith({
          text: "support null values",
          colour: "orange",
        })
      })
    })

    describe("when the user clicks an option with the mouse", () => {
      it("selects that option", async () => {
        const user = userEvent.setup()
        const onChange = jest.fn()
        render(<Combobox {...commonProps} onChange={onChange} />)

        const input = screen.getByRole("textbox")
        await user.type(input, "dev")
        await user.click(screen.getByRole("option", { name: "dev prod" }))

        expect(onChange).toHaveBeenCalledWith(
          expect.objectContaining({ text: "dev prod" })
        )
        expect(input).toHaveValue("")
      })
    })

    describe("when the user types a tag that's in the list of options and presses enter", () => {
      it("updates the value, using the value in the list of options", async () => {
        const user = userEvent.setup()
        const onChange = jest.fn()
        render(<Combobox {...commonProps} onChange={onChange} />)

        const input = screen.getByRole("textbox")
        const selectedOption = mockOptions[4]
        await user.type(input, selectedOption.text)
        await user.type(input, "{Enter}")

        expect(onChange).toHaveBeenCalledWith(selectedOption)
      })
    })
  })

  describe("when the user presses Enter without adding any text", () => {
    it("doesn't swallow the key event", async () => {
      const user = userEvent.setup()
      const onKeyDown = jest.fn()
      render(
        <div onKeyDown={onKeyDown}>
          <Combobox {...commonProps} />
        </div>
      )

      const input = screen.getByRole("textbox")
      await user.type(input, "{Enter}")

      expect(onKeyDown).toHaveBeenCalled()
    })
  })

  it("shows the list of options & navigates the list via arrow keys & space to select", async () => {
    const user = userEvent.setup()
    const onChange = jest.fn()
    const { rerender } = render(
      <Combobox {...commonProps} onChange={onChange} value={undefined} />
    )

    mockOptions.forEach((option) => {
      expect(
        screen.getByRole("option", { name: option.text })
      ).toBeInTheDocument()
    })

    const input = screen.getByRole("textbox")
    await user.type(input, "{ArrowDown}{ArrowDown} ")
    expect(onChange).toHaveBeenCalledWith(mockOptions[1])
    expect(input).toHaveValue("") // Not space!

    rerender(
      <Combobox {...commonProps} onChange={onChange} value={mockOptions[1]} />
    )

    await user.keyboard("{ArrowUp}{ArrowUp} ")
    expect(onChange).toHaveBeenCalledWith(mockOptions[mockOptions.length - 1])
  })

  describe("when the user types in the input", () => {
    it("filters the list of options", async () => {
      const user = userEvent.setup()
      const onChange = jest.fn()
      render(
        <Combobox {...commonProps} onChange={onChange} value={mockOptions[0]} />
      )

      const input = screen.getByRole("textbox")
      await user.type(input, "pr")

      const options = screen.getAllByRole("option")
      expect(options).toHaveLength(2)
      expect(options[0]).toHaveTextContent(/dev prod/)
      expect(options[1]).toHaveTextContent(/PR/)

      await user.keyboard("{ArrowDown} ")
      expect(onChange).toHaveBeenCalledWith(
        expect.objectContaining({ text: "dev prod" })
      )
    })
  })

  describe("when the user types a label with a space in it", () => {
    it("doesn't select anything from the option list unless they pressed the arrow keys first", async () => {
      const user = userEvent.setup()
      const onChange = jest.fn()
      render(<Combobox {...commonProps} onChange={onChange} />)

      const input = screen.getByRole("textbox")
      await user.type(input, " ")

      expect(onChange).not.toHaveBeenCalled()

      await user.type(input, "dev ")

      expect(onChange).not.toHaveBeenCalled()

      await user.type(input, "{ArrowDown} ")

      expect(onChange).toHaveBeenCalledWith(
        expect.objectContaining({ text: "dev prod" })
      )
      expect(input).toHaveValue("")

      onChange.mockClear()
      await user.type(input, "{ArrowDown}{ArrowDown}")
      await user.type(input, "dev ")
      expect(onChange).not.toHaveBeenCalled()

      await user.type(input, "{Enter}")
      expect(onChange).toHaveBeenCalledWith(
        expect.objectContaining({ text: "dev" })
      )
    })
  })
})
