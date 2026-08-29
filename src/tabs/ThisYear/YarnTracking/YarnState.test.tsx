import { screen } from "@testing-library/react"
import { YarnState } from "./YarnState"
import { renderWithStorage } from "../../../shared/storageContextTestUtils"

const yarnState = {
  wool: {
    id: "wool",
    history: {
      "26-01": 300,
      "26-02": 800,
    },
  },
  cotton: {
    id: "cotton",
    history: {
      "26-01": 200,
    },
  },
}

describe("YarnState", () => {
  beforeEach(() => {
    jest.useFakeTimers()
    jest.setSystemTime(new Date("2026-03-11"))
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it("shows the monthly totals, carrying the current month forward", () => {
    renderWithStorage(<YarnState />, {
      value: { useValue: jest.fn().mockReturnValue({ value: yarnState }) },
    })

    expect(screen.getByText(/January: 500g/)).toBeInTheDocument()
    expect(screen.getByText(/February: 1,000g/)).toBeInTheDocument()
    expect(screen.getByText(/Current: 1,000g/)).toBeInTheDocument()
  })

  it("sets the bar widths as percentages of the highest amount", () => {
    renderWithStorage(<YarnState />, {
      value: { useValue: jest.fn().mockReturnValue({ value: yarnState }) },
    })

    const [january, february, current] = screen.getAllByRole("listitem")

    expect(january).toHaveAttribute("style", "width: 50%;")
    expect(february).toHaveAttribute("style", "width: 100%;")
    expect(current).toHaveAttribute("style", "width: 100%;")
  })
})
