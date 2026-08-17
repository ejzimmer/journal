import { fireEvent, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { LabelsControl, LabelsControlProps } from "./LabelsControl"
import { LabelsContext } from "./LabelsContext"
import { Label } from "./types"

const mockOptions: Label[] = [
  { value: "a11y", colour: "blue" },
  { value: "i18n", colour: "yellow" },
  { value: "dev prod", colour: "purple" },
  { value: "feature flag", colour: "green" },
  { value: "PR", colour: "orange" },
]

const mockValues: Label[] = [mockOptions[0], mockOptions[1]]

const commonProps: LabelsControlProps = {
  value: mockValues,
  onChange: jest.fn(),
  label: "Things",
}

const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <LabelsContext.Provider value={mockOptions}>
    {children}
  </LabelsContext.Provider>
)

describe("LabelsControl", () => {
  describe("When the user types some text and presses enter", () => {
    it("Adds a new tag & clears the input", async () => {
      const user = userEvent.setup()
      const onChange = jest.fn()
      const { rerender } = render(
        <LabelsControl {...commonProps} value={[]} onChange={onChange} />,
        {
          wrapper: Wrapper,
        },
      )

      const input = screen.getByRole("combobox")
      await user.type(input, "a11y{Enter}")

      expect(onChange).toHaveBeenCalledTimes(1)
      expect(onChange).toHaveBeenCalledWith([mockValues[0]])
      expect(input).toHaveValue("")

      rerender(
        <LabelsControl
          {...commonProps}
          onChange={onChange}
          value={[mockValues[0]]}
        />,
      )

      expect(
        screen.getByRole("button", { name: "Remove a11y" }),
      ).toBeInTheDocument()

      await user.type(input, "i18n{Enter}")

      expect(onChange).toHaveBeenCalledWith([mockValues[0], mockValues[1]])
    })
  })

  describe("when the user clicks remove <label name>", () => {
    it("removes the label", async () => {
      const user = userEvent.setup()
      const onChange = jest.fn()
      render(<LabelsControl {...commonProps} onChange={onChange} />, {
        wrapper: Wrapper,
      })

      await user.click(screen.getByRole("button", { name: "Remove a11y" }))

      expect(onChange).toHaveBeenCalledWith([mockValues[1]])
    })
  })

  describe("when some options are already selected", () => {
    it("doesn't show those options in the list", async () => {
      const onChange = jest.fn()
      render(<LabelsControl {...commonProps} onChange={onChange} />, {
        wrapper: Wrapper,
      })

      const options = screen.getAllByRole("option")
      expect(options).toHaveLength(mockOptions.length - mockValues.length)
      options.forEach((option) => {
        expect(option).not.toHaveTextContent(mockValues[0].value)
        expect(option).not.toHaveTextContent(mockValues[1].value)
      })
    })
  })

  describe("when the user clicks an option with the mouse", () => {
    it("selects that option", async () => {
      const user = userEvent.setup()
      const onChange = jest.fn()
      render(<LabelsControl {...commonProps} onChange={onChange} />, {
        wrapper: Wrapper,
      })

      const input = screen.getByRole("combobox")
      await user.type(input, "dev")
      await user.click(screen.getByRole("option", { name: "dev prod" }))

      expect(onChange).toHaveBeenCalledWith([
        ...mockValues,
        expect.objectContaining({ value: "dev prod" }),
      ])
      expect(input).toHaveValue("")
    })
  })

  describe("when the user types a tag that's in the list of options and presses enter", () => {
    it("updates the value, using the value in the list of options", async () => {
      const user = userEvent.setup()
      const onChange = jest.fn()
      render(<LabelsControl {...commonProps} onChange={onChange} />, {
        wrapper: Wrapper,
      })

      const input = screen.getByRole("combobox")
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
      render(<LabelsControl {...commonProps} onChange={onChange} />, {
        wrapper: Wrapper,
      })

      const input = screen.getByRole("combobox")
      await user.type(input, "apex{Enter}")

      expect(onChange).toHaveBeenCalledWith([
        ...mockValues,
        { value: "apex", colour: "red" },
      ])
    })
  })
})

describe("LabelsControl when isMulti is false", () => {
  const singleProps: LabelsControlProps = {
    value: [],
    onChange: jest.fn(),
    label: "List label",
    isMulti: false,
  }

  it("selects an option with the mouse, replacing any existing value", async () => {
    const user = userEvent.setup()
    const onChange = jest.fn()
    render(
      <LabelsControl
        {...singleProps}
        value={[mockValues[0]]}
        onChange={onChange}
      />,
      { wrapper: Wrapper },
    )

    await user.click(screen.getByRole("combobox"))
    await user.click(screen.getByRole("option", { name: "dev prod" }))

    expect(onChange).toHaveBeenCalledWith([
      expect.objectContaining({ value: "dev prod" }),
    ])
  })

  it("creates a new label from typed text", () => {
    const onChange = jest.fn()
    render(<LabelsControl {...singleProps} onChange={onChange} />, {
      wrapper: Wrapper,
    })

    const input = screen.getByRole("combobox")
    fireEvent.change(input, { target: { value: "apex" } })

    expect(onChange).toHaveBeenCalledWith([{ value: "apex", colour: "red" }])
  })

  it("doesn't show a remove button for the selected value", () => {
    render(<LabelsControl {...singleProps} value={[mockValues[0]]} />, {
      wrapper: Wrapper,
    })

    expect(
      screen.queryByRole("button", { name: "Remove a11y" }),
    ).not.toBeInTheDocument()
  })
})

describe("when onCreateLabel is provided", () => {
  it("delegates label creation to it instead of creating locally", async () => {
    const user = userEvent.setup()
    const onChange = jest.fn()
    const onCreateLabel = jest.fn(
      (value: string): Label => ({ value, colour: "green" }),
    )
    render(
      <LabelsControl
        {...commonProps}
        onChange={onChange}
        onCreateLabel={onCreateLabel}
      />,
      { wrapper: Wrapper },
    )

    const input = screen.getByRole("combobox")
    await user.type(input, "apex{Enter}")

    expect(onCreateLabel).toHaveBeenCalledWith("apex")
    expect(onChange).toHaveBeenCalledWith([
      ...mockValues,
      { value: "apex", colour: "green" },
    ])
  })
})
