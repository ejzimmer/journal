import { render, screen } from "@testing-library/react"
import { YarnState } from "./YarnState"
import { FirebaseContext } from "../../../shared/FirebaseContext"
import { ReactNode } from "react"

const yarnState = {
  acrylic: {
    history: [{ balance: 189, date: new Date("2026-01-01").getTime() }],
    id: "acrylic",
  },
  cotton: {
    history: [{ balance: 850, date: new Date("2026-01-01").getTime() }],
    id: "cotton",
  },
  "sock yarn": {
    history: [
      { balance: 2519, date: new Date("2026-01-01").getTime() },
      { balance: 2471, date: new Date("2026-01-21").getTime() },
      { balance: 1121, date: new Date("2026-02-01").getTime() },
      { balance: 957, date: new Date("2026-02-16").getTime() },
    ],
    id: "sock yarn",
  },
  wool: {
    history: [
      { balance: 3347, date: new Date("2026-01-01").getTime() },
      { balance: 3547, date: new Date("2026-03-07").getTime() },
    ],
    id: "wool",
  },
}

function Wrapper({ children }: { children: ReactNode }) {
  return (
    <FirebaseContext.Provider
      value={{
        addItem: jest.fn(),
        updateItem: jest.fn(),
        deleteItem: jest.fn(),
        updateList: jest.fn(),
        useValue: jest.fn().mockReturnValue({ value: yarnState }),
      }}
    >
      {children}
    </FirebaseContext.Provider>
  )
}

describe("YarnState", () => {
  it("show the current, initial & monthly totals", () => {
    render(<YarnState />, {
      wrapper: Wrapper,
    })

    expect(screen.getByText(/Initial: 6,905g/)).toBeInTheDocument()
    expect(screen.getByText(/January: 6,857g/)).toBeInTheDocument()
    expect(screen.getByText(/February: 5,343g/)).toBeInTheDocument()
    expect(screen.getByText(/Current: 5,543g/)).toBeInTheDocument()
  })

  it("sets the bar widths as percentages of the highest amount", () => {
    render(<YarnState />, {
      wrapper: Wrapper,
    })

    const [initial, january, february, current] =
      screen.getAllByRole("listitem")

    expect(initial).toHaveAttribute("style", "width: 100%;")
    expect(january).toHaveAttribute("style", "width: 99.3%;")
    expect(february).toHaveAttribute("style", "width: 77.4%;")
    expect(current).toHaveAttribute("style", "width: 80.3%;")
  })
})
