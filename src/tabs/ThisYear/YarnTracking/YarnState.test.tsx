import { render, screen } from "@testing-library/react"
import { YarnState } from "./YarnState"
import { ReactNode } from "react"
import { StorageContextWrapper } from "../../../shared/storageContextTestUtils"

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

function Wrapper({ children }: { children: ReactNode }) {
  return (
    <StorageContextWrapper
      value={{ useValue: jest.fn().mockReturnValue({ value: yarnState }) }}
    >
      {children}
    </StorageContextWrapper>
  )
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
    render(<YarnState />, {
      wrapper: Wrapper,
    })

    expect(screen.getByText(/January: 500g/)).toBeInTheDocument()
    expect(screen.getByText(/February: 1,000g/)).toBeInTheDocument()
    expect(screen.getByText(/Current: 1,000g/)).toBeInTheDocument()
  })

  it("sets the bar widths as percentages of the highest amount", () => {
    render(<YarnState />, {
      wrapper: Wrapper,
    })

    const [january, february, current] = screen.getAllByRole("listitem")

    expect(january).toHaveAttribute("style", "width: 50%;")
    expect(february).toHaveAttribute("style", "width: 100%;")
    expect(current).toHaveAttribute("style", "width: 100%;")
  })
})
