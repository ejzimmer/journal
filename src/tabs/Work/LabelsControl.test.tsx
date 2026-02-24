import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import {
  getNextColour,
  LabelsControl,
  LabelsControlProps,
} from "./LabelsControl"
import { COLOURS } from "./types"
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
