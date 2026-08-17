import { fireEvent, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import {
  getNextColour,
  LabelsControl,
  LabelsControlProps,
} from "./LabelsControl"
import { COLOURS } from "./types"
import { LabelsContext } from "./LabelsContext"
import { FirebaseContext } from "../../shared/FirebaseContext"
import { Label } from "./types"

const mockOptions: Label[] = [
  { id: "label-a11y", value: "a11y", colour: "blue" },
  { id: "label-i18n", value: "i18n", colour: "yellow" },
  { id: "label-dev-prod", value: "dev prod", colour: "purple" },
  { id: "label-feature-flag", value: "feature flag", colour: "green" },
  { id: "label-pr", value: "PR", colour: "orange" },
]

const mockValues: Label[] = [mockOptions[0], mockOptions[1]]

const commonProps: LabelsControlProps = {
  value: mockValues.map((l) => l.id),
  onChange: jest.fn(),
  label: "Things",
}

function createStorageContext() {
  return {
    addItem: jest.fn(() => "new-label-id"),
    updateItem: jest.fn(),
    deleteItem: jest.fn(),
    updateList: jest.fn(),
    useValue: () => ({ value: undefined, loading: false }),
  }
}

const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <FirebaseContext.Provider value={createStorageContext()}>
    <LabelsContext.Provider value={mockOptions}>
      {children}
    </LabelsContext.Provider>
  </FirebaseContext.Provider>
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
      expect(onChange).toHaveBeenCalledWith([mockValues[0].id])
      expect(input).toHaveValue("")

      rerender(
        <LabelsControl
          {...commonProps}
          onChange={onChange}
          value={[mockValues[0].id]}
        />,
      )

      expect(
        screen.getByRole("button", { name: "Remove a11y" }),
      ).toBeInTheDocument()

      await user.type(input, "i18n{Enter}")

      expect(onChange).toHaveBeenCalledWith([mockValues[0].id, mockValues[1].id])
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

      expect(onChange).toHaveBeenCalledWith([mockValues[1].id])
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
        ...mockValues.map((l) => l.id),
        mockOptions[2].id,
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

      expect(onChange).toHaveBeenCalledWith([
        ...mockValues.map((l) => l.id),
        selectedOption.id,
      ])
    })
  })

  describe("when a new option is added", () => {
    it("persists it to the database and is assigned a colour based on the total number of options", async () => {
      const user = userEvent.setup()
      const onChange = jest.fn()
      const storageContext = createStorageContext()
      render(
        <FirebaseContext.Provider value={storageContext}>
          <LabelsContext.Provider value={mockOptions}>
            <LabelsControl {...commonProps} onChange={onChange} />
          </LabelsContext.Provider>
        </FirebaseContext.Provider>,
      )

      const input = screen.getByRole("combobox")
      await user.type(input, "apex{Enter}")

      expect(storageContext.addItem).toHaveBeenCalledWith("work-labels", {
        value: "apex",
        colour: "red",
      })
      expect(onChange).toHaveBeenCalledWith([
        ...mockValues.map((l) => l.id),
        "new-label-id",
      ])
    })
  })

  describe("when a label was removed more than a week ago", () => {
    it("deletes it from the database", () => {
      const staleLabel: Label = {
        id: "label-stale",
        value: "stale",
        colour: "red",
        lastRemoved: Date.now() - 8 * 24 * 60 * 60 * 1000,
      }
      const storageContext = createStorageContext()
      render(
        <FirebaseContext.Provider value={storageContext}>
          <LabelsContext.Provider value={[...mockOptions, staleLabel]}>
            <LabelsControl {...commonProps} onChange={jest.fn()} />
          </LabelsContext.Provider>
        </FirebaseContext.Provider>,
      )

      expect(storageContext.deleteItem).toHaveBeenCalledWith(
        "work-labels",
        staleLabel,
      )
    })
  })

  describe("when a label was removed less than a week ago", () => {
    it("doesn't delete it", () => {
      const recentLabel: Label = {
        id: "label-recent",
        value: "recent",
        colour: "red",
        lastRemoved: Date.now() - 2 * 24 * 60 * 60 * 1000,
      }
      const storageContext = createStorageContext()
      render(
        <FirebaseContext.Provider value={storageContext}>
          <LabelsContext.Provider value={[...mockOptions, recentLabel]}>
            <LabelsControl {...commonProps} onChange={jest.fn()} />
          </LabelsContext.Provider>
        </FirebaseContext.Provider>,
      )

      expect(storageContext.deleteItem).not.toHaveBeenCalled()
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
        value={[mockValues[0].id]}
        onChange={onChange}
      />,
      { wrapper: Wrapper },
    )

    await user.click(screen.getByRole("combobox"))
    await user.click(screen.getByRole("option", { name: "dev prod" }))

    expect(onChange).toHaveBeenCalledWith([mockOptions[2].id])
  })

  it("creates a new label from typed text", () => {
    const onChange = jest.fn()
    const storageContext = createStorageContext()
    render(
      <FirebaseContext.Provider value={storageContext}>
        <LabelsContext.Provider value={mockOptions}>
          <LabelsControl {...singleProps} onChange={onChange} />
        </LabelsContext.Provider>
      </FirebaseContext.Provider>,
    )

    const input = screen.getByRole("combobox")
    fireEvent.change(input, { target: { value: "apex" } })

    expect(storageContext.addItem).toHaveBeenCalledWith("work-labels", {
      value: "apex",
      colour: "red",
    })
    expect(onChange).toHaveBeenCalledWith(["new-label-id"])
  })

  it("doesn't show a remove button for the selected value", () => {
    render(
      <LabelsControl {...singleProps} value={[mockValues[0].id]} />,
      {
        wrapper: Wrapper,
      },
    )

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
