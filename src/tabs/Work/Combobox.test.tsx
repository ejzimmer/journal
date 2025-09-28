import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { Combobox, ComboboxProps, Tag } from "./Combobox"

const mockOptions: Tag[] = [
  { value: "a11y", colour: "blue" },
  { value: "i18n", colour: "yellow" },
  { value: "dev prod", colour: "purple" },
  { value: "feature flag", colour: "green" },
  { value: "PR", colour: "orange" },
]

const mockValues: Tag[] = [mockOptions[0], mockOptions[1]]

const commonProps: ComboboxProps = {
  value: mockValues,
  onChange: jest.fn(),
  options: mockOptions,
  label: "Things",
}

describe("Combobox", () => {
  describe("When the user types some text and presses enter", () => {
    it("Adds a new tag & clears the input", async () => {
      const user = userEvent.setup()
      const onChange = jest.fn()
      const { rerender } = render(
        <Combobox {...commonProps} value={[]} onChange={onChange} />
      )

      const input = screen.getByRole("textbox")
      await user.type(input, "a11y{Enter}")

      expect(onChange).toHaveBeenCalledTimes(1)
      expect(onChange).toHaveBeenCalledWith([mockValues[0]])
      expect(input).toHaveValue("")

      rerender(
        <Combobox
          {...commonProps}
          onChange={onChange}
          value={[mockValues[0]]}
        />
      )

      expect(
        screen.getByRole("button", { name: "Remove a11y" })
      ).toBeInTheDocument()

      await user.type(input, "i18n{Enter}")

      expect(onChange).toHaveBeenCalledWith([mockValues[0], mockValues[1]])
    })
  })

  describe("when the user presses Enter without adding any text", () => {
    it("doesn't swallows the key event", async () => {
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

  describe("when the user clicks remove <label name>", () => {
    it("removes the label", async () => {
      const user = userEvent.setup()
      const onChange = jest.fn()
      render(<Combobox {...commonProps} onChange={onChange} />)

      await user.click(screen.getByRole("button", { name: "Remove a11y" }))

      expect(onChange).toHaveBeenCalledWith([mockValues[1]])
    })
  })

  describe("when the user clicks clear all", () => {
    it("removes all the labels and any text in the input", async () => {
      const user = userEvent.setup()
      const onChange = jest.fn()
      render(<Combobox {...commonProps} onChange={onChange} />)

      const input = screen.getByRole("textbox")
      await user.type(input, "dev prod")

      await user.click(screen.getByRole("button", { name: "Clear all" }))

      expect(onChange).toHaveBeenCalledWith([])
      expect(input).toHaveValue("")
    })
  })

  it("shows the list of options & navigates the list via arrow keys & space to select", async () => {
    const user = userEvent.setup()
    const onChange = jest.fn()
    const { rerender } = render(
      <Combobox {...commonProps} onChange={onChange} value={[]} />
    )

    mockOptions.forEach((option) => {
      expect(
        screen.getByRole("option", { name: option.value })
      ).toBeInTheDocument()
    })

    const input = screen.getByRole("textbox")
    await user.type(input, "{ArrowDown}{ArrowDown} ")
    expect(onChange).toHaveBeenCalledWith([mockOptions[1]])
    expect(input).toHaveValue("") // Not space!

    rerender(
      <Combobox {...commonProps} onChange={onChange} value={[mockOptions[1]]} />
    )

    await user.keyboard("{ArrowUp}{ArrowUp} ")
    expect(onChange).toHaveBeenCalledWith([
      mockOptions[1],
      mockOptions[mockOptions.length - 1],
    ])
  })

  describe("when the user types in the input", () => {
    it("filters the list of options", async () => {
      const user = userEvent.setup()
      const onChange = jest.fn()
      render(<Combobox {...commonProps} onChange={onChange} value={[]} />)

      const input = screen.getByRole("textbox")
      await user.type(input, "pr")

      const options = screen.getAllByRole("option")
      expect(options).toHaveLength(2)
      expect(options[0]).toHaveTextContent(/dev prod/)
      expect(options[1]).toHaveTextContent(/PR/)

      await user.keyboard("{ArrowDown} ")
      expect(onChange).toHaveBeenCalledWith([
        expect.objectContaining({ value: "dev prod" }),
      ])
    })
  })

  describe("when some options are already selected", () => {
    it("doesn't show those options in the list", async () => {
      const onChange = jest.fn()
      render(<Combobox {...commonProps} onChange={onChange} />)

      const options = screen.getAllByRole("option")
      expect(options).toHaveLength(mockOptions.length - mockValues.length)
      options.forEach((option) => {
        expect(option).not.toHaveTextContent(mockValues[0].value)
        expect(option).not.toHaveTextContent(mockValues[1].value)
      })
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

      expect(onChange).toHaveBeenCalledWith([
        ...mockValues,
        expect.objectContaining({ value: "dev prod" }),
      ])
      expect(input).toHaveValue("")

      onChange.mockClear()
      await user.type(input, "{ArrowDown}{ArrowDown}")
      await user.type(input, "dev ")
      expect(onChange).not.toHaveBeenCalled()

      await user.type(input, "{Enter}")
      expect(onChange).toHaveBeenCalledWith([
        ...mockValues,
        expect.objectContaining({ value: "dev" }),
      ])
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

      expect(onChange).toHaveBeenCalledWith([
        ...mockValues,
        expect.objectContaining({ value: "dev prod" }),
      ])
      expect(input).toHaveValue("")
    })
  })

  describe("when the user types a tag that has already been selected and presses enter", () => {
    it("doesn't add a new tag", async () => {
      const user = userEvent.setup()
      const onChange = jest.fn()
      render(<Combobox {...commonProps} onChange={onChange} />)

      const input = screen.getByRole("textbox")
      await user.type(input, mockValues[0].value)
      await user.type(input, "{Enter}")

      expect(onChange).not.toHaveBeenCalled()
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
      await user.type(input, selectedOption.value)
      await user.type(input, "{Enter}")

      expect(onChange).toHaveBeenCalledWith([...mockValues, selectedOption])
    })
  })

  describe("when a new option is added", () => {
    it("is assigned a colour based on the total number of options", async () => {
      const user = userEvent.setup()
      const onChange = jest.fn()
      const { rerender } = render(
        <Combobox {...commonProps} onChange={onChange} />
      )

      const input = screen.getByRole("textbox")
      await user.type(input, "apex{Enter}")

      expect(onChange).toHaveBeenCalledWith([
        ...mockValues,
        { value: "apex", colour: "red" },
      ])

      rerender(
        <Combobox
          {...commonProps}
          onChange={onChange}
          options={[...mockOptions, { value: "apex", colour: "red" }]}
        />
      )
      await user.type(input, "training{Enter}")

      expect(onChange).toHaveBeenCalledWith([
        ...mockValues,
        { value: "training", colour: "blue" },
      ])
    })
  })
})
