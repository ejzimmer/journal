import { fireEvent, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import {
  getNextColour,
  LabelsControl,
  LabelsControlProps,
} from "./LabelsControl"
import { COLOURS, StoredLabel } from "./types"
import { WorkStorageContext } from "./WorkStorageContext"
import { createWorkStorageContext } from "./workStorageTestUtils"

const mockOptions: StoredLabel[] = [
  { id: "id-a11y", value: "a11y", colour: "blue" },
  { id: "id-i18n", value: "i18n", colour: "yellow" },
  { id: "id-dev-prod", value: "dev prod", colour: "purple" },
  { id: "id-feature-flag", value: "feature flag", colour: "green" },
  { id: "id-PR", value: "PR", colour: "orange" },
]

const mockValues = [
  { value: mockOptions[0].value, colour: mockOptions[0].colour },
  { value: mockOptions[1].value, colour: mockOptions[1].colour },
]

const commonProps: LabelsControlProps = {
  value: mockValues,
  onChange: jest.fn(),
  label: "Things",
}

const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <WorkStorageContext.Provider
    value={createWorkStorageContext({ labels: mockOptions })}
  >
    {children}
  </WorkStorageContext.Provider>
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
        { value: "dev prod", colour: "purple" },
      ])
      expect(input).toHaveValue("")
    })
  })

  describe("when the user types a tag that's in the list of options and presses enter", () => {
    it("updates the value, using the value and colour already in the list of options", async () => {
      const user = userEvent.setup()
      const onChange = jest.fn()
      render(<LabelsControl {...commonProps} onChange={onChange} />, {
        wrapper: Wrapper,
      })

      const input = screen.getByRole("combobox")
      const selectedOption = mockOptions[4]
      await user.type(input, selectedOption.value)
      await user.type(input, "{Enter}")

      expect(onChange).toHaveBeenCalledWith([
        ...mockValues,
        { value: selectedOption.value, colour: selectedOption.colour },
      ])
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
      { value: "dev prod", colour: "purple" },
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

describe("getNextColour", () => {
  describe("when there are no existing options", () => {
    it("returns the first colour in the list", () => {
      const nextColour = getNextColour([])

      expect(nextColour).toBe(COLOURS[0])
    })
  })

  describe("when some colours have been used", () => {
    it("returns the first unused colour", () => {
      let nextColour = getNextColour([COLOURS[5]])
      expect(nextColour).toBe(COLOURS[0])

      nextColour = getNextColour([COLOURS[0], COLOURS[1], COLOURS[4]])
      expect(nextColour).toBe(COLOURS[2])
    })
  })

  describe("when all the colours have been used at least once", () => {
    it("returns the first colour used the least number of times", () => {
      let nextColour = getNextColour([...COLOURS])
      expect(nextColour).toBe(COLOURS[0])

      nextColour = getNextColour([
        ...COLOURS,
        COLOURS[0],
        COLOURS[1],
        COLOURS[4],
      ])
      expect(nextColour).toBe(COLOURS[2])

      nextColour = getNextColour([
        ...COLOURS,
        ...COLOURS,
        COLOURS[1],
        COLOURS[2],
        COLOURS[5],
        COLOURS[0],
        COLOURS[0],
      ])
      expect(nextColour).toBe(COLOURS[3])
    })
  })
})
