import { render, screen } from "@testing-library/react"
import { ReactNode } from "react"
import { Days } from "./Days"
import { FirebaseContext } from "../../shared/FirebaseContext"
import { DayData } from "../../shared/types"

function Wrapper({
  children,
  dailyData,
}: {
  children: ReactNode
  dailyData?: Record<string, DayData>
}) {
  return (
    <FirebaseContext.Provider
      value={{
        addItem: jest.fn(),
        updateItem: jest.fn(),
        deleteItem: jest.fn(),
        updateList: jest.fn(),
        useValue: jest
          .fn()
          .mockReturnValue({ loading: false, value: dailyData }),
      }}
    >
      {children}
    </FirebaseContext.Provider>
  )
}

function renderWithData(dailyData?: Record<string, DayData>) {
  return render(<Days />, {
    wrapper: (props) => <Wrapper {...props} dailyData={dailyData} />,
  })
}

describe("Days", () => {
  it("shows a circle for every day so far this year", () => {
    jest.useFakeTimers()
    jest.setSystemTime(new Date("2026-01-21"))

    renderWithData()

    expect(screen.getAllByRole("listitem")).toHaveLength(21)

    jest.useRealTimers()
  })

  it("anchors the grid to 1 January's weekday", () => {
    jest.useFakeTimers()
    jest.setSystemTime(new Date("2026-01-21"))

    renderWithData()

    // 1 Jan 2026 is a Thursday
    expect(screen.getByRole("list", { name: "by day" })).toHaveStyle({
      "--starting-index": "4",
    })

    jest.useRealTimers()
  })
})
