import { render, screen } from "@testing-library/react"
import { ReactNode } from "react"
import { DailyBreakdown } from "./DailyBreakdown"
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
        useValue: jest.fn().mockReturnValue({ loading: false, value: dailyData }),
      }}
    >
      {children}
    </FirebaseContext.Provider>
  )
}

function renderWithData(dailyData?: Record<string, DayData>) {
  return render(<DailyBreakdown />, {
    wrapper: (props) => <Wrapper {...props} dailyData={dailyData} />,
  })
}

describe("DailyBreakdown", () => {
  it("shows a circle for every day so far this year", () => {
    jest.useFakeTimers()
    jest.setSystemTime(new Date("2026-01-21"))

    renderWithData()

    expect(screen.getAllByRole("listitem")).toHaveLength(21)

    jest.useRealTimers()
  })

  it("positions each day under its correct day of the week, week starting Monday", () => {
    jest.useFakeTimers()
    jest.setSystemTime(new Date("2026-01-21"))

    renderWithData()

    // 1 Jan 2026 is a Thursday, 4 Jan a Sunday (last row), 5 Jan a Monday (first row)
    expect(screen.getByText("1/1")).toHaveStyle({ gridRow: "4" })
    expect(screen.getByText("4/1")).toHaveStyle({ gridRow: "7" })
    expect(screen.getByText("5/1")).toHaveStyle({ gridRow: "1" })

    jest.useRealTimers()
  })

  it("groups days into a column per calendar week", () => {
    jest.useFakeTimers()
    jest.setSystemTime(new Date("2026-01-21"))

    renderWithData()

    // 1 Jan falls partway into its (Monday-starting) week, so 1-4 Jan share
    // a column with the days immediately before New Year's Day that don't
    // exist in the data; 5 Jan (a Monday) starts a fresh column
    expect(screen.getByText("1/1")).toHaveStyle({ gridColumn: "1" })
    expect(screen.getByText("4/1")).toHaveStyle({ gridColumn: "1" })
    expect(screen.getByText("5/1")).toHaveStyle({ gridColumn: "2" })
    expect(screen.getByText("11/1")).toHaveStyle({ gridColumn: "2" })
    expect(screen.getByText("12/1")).toHaveStyle({ gridColumn: "3" })
    expect(screen.getByText("21/1")).toHaveStyle({ gridColumn: "4" })

    jest.useRealTimers()
  })

  it("starts a partial trailing week at the top of its column instead of mid-column", () => {
    jest.useFakeTimers()
    // 21 Jan 2026 is a Wednesday, so the current week only has Mon-Wed so far
    jest.setSystemTime(new Date("2026-01-21"))

    renderWithData()

    expect(screen.getByText("19/1")).toHaveStyle({ gridRow: "1" }) // Monday
    expect(screen.getByText("20/1")).toHaveStyle({ gridRow: "2" }) // Tuesday
    expect(screen.getByText("21/1")).toHaveStyle({ gridRow: "3" }) // Wednesday - today

    jest.useRealTimers()
  })

  it("doesn't set a colour for a day with no data", () => {
    jest.useFakeTimers()
    jest.setSystemTime(new Date("2026-01-21"))

    renderWithData()

    const day = screen.getByText("1/1")
    expect(day.style.getPropertyValue("--day-colour")).toBe("")

    jest.useRealTimers()
  })

  it("colours a surplus day orange and a deficit day green, more intensely for a bigger gap", () => {
    jest.useFakeTimers()
    jest.setSystemTime(new Date("2026-01-21"))

    const dailyData: Record<string, DayData> = {
      "5Jan": { id: "5Jan", consumed: 1500, expended: 2500 }, // deficit, diff +1000
      "10Jan": { id: "10Jan", consumed: 2200, expended: 2000 }, // surplus, diff -200
      "15Jan": { id: "15Jan", consumed: 3000, expended: 2000 }, // surplus, diff -1000
    }
    renderWithData(dailyData)

    const bigDeficit = screen.getByText("5/1").style.getPropertyValue("--day-colour")
    const smallSurplus = screen.getByText("10/1").style.getPropertyValue("--day-colour")
    const bigSurplus = screen.getByText("15/1").style.getPropertyValue("--day-colour")

    expect(bigDeficit).toMatch(/^hsl\(105 /)
    expect(smallSurplus).toMatch(/^hsl\(32 /)
    expect(bigSurplus).toMatch(/^hsl\(32 /)

    const saturationOf = (hsl: string) => Number(hsl.split(" ")[1].replace("%", ""))
    expect(saturationOf(bigSurplus)).toBeGreaterThan(saturationOf(smallSurplus))

    jest.useRealTimers()
  })
})
