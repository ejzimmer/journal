import { render, screen } from "@testing-library/react"
import { ReactNode } from "react"
import { WeeklyCalorieTracker } from "./WeeklyCalorieTracker"
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
  return render(<WeeklyCalorieTracker />, {
    wrapper: (props) => <Wrapper {...props} dailyData={dailyData} />,
  })
}

function daysOfConstantDiff(
  startDay: number,
  endDay: number,
  { consumed, expended }: { consumed: number; expended: number },
) {
  const dailyData: Record<string, DayData> = {}
  for (let day = startDay; day <= endDay; day += 1) {
    dailyData[`${day}Jan`] = { id: `${day}Jan`, consumed, expended }
  }
  return dailyData
}

describe("WeeklyCalorieTracker", () => {
  it("doesn't show a duplicate bar when today completes a week", () => {
    jest.useFakeTimers()
    jest.setSystemTime(new Date("2026-01-07"))

    const dailyData = daysOfConstantDiff(1, 7, { consumed: 2000, expended: 2500 })
    renderWithData(dailyData)

    const bars = screen.getAllByText(/^\d+ Jan: /)
    expect(bars).toHaveLength(1)

    jest.useRealTimers()
  })

  it("still shows a bar for the current, incomplete week", () => {
    jest.useFakeTimers()
    jest.setSystemTime(new Date("2026-01-09"))

    const dailyData = daysOfConstantDiff(1, 8, { consumed: 2000, expended: 2500 })
    renderWithData(dailyData)

    const bars = screen.getAllByText(/^\d+ Jan: /)
    expect(bars).toHaveLength(2)

    jest.useRealTimers()
  })

  it("shows a bar for every week", () => {
    jest.useFakeTimers()
    jest.setSystemTime(new Date("2026-01-21"))

    const dailyData = daysOfConstantDiff(1, 21, { consumed: 2000, expended: 2500 })
    renderWithData(dailyData)

    const bars = screen.getAllByText(/^\d+ Jan: /)
    expect(bars).toHaveLength(3)

    jest.useRealTimers()
  })

  it("marks the highest calorie week", () => {
    jest.useFakeTimers()
    jest.setSystemTime(new Date("2026-01-21"))

    const dailyData = {
      ...daysOfConstantDiff(1, 7, { consumed: 2000, expended: 2100 }), // diff +100/day
      ...daysOfConstantDiff(8, 14, { consumed: 2500, expended: 2000 }), // diff -500/day
      ...daysOfConstantDiff(15, 21, { consumed: 2000, expended: 3000 }), // diff +1000/day
    }
    renderWithData(dailyData)

    expect(screen.getByRole("img", { name: "14 Jan: 22,487" })).toHaveClass(
      "week-highest",
    )
    expect(screen.getByRole("img", { name: "7 Jan: 18,987" })).not.toHaveClass(
      "week-highest",
    )
    expect(screen.getByRole("img", { name: "21 Jan: 15,487" })).not.toHaveClass(
      "week-highest",
    )

    jest.useRealTimers()
  })

  it("marks the lowest calorie week", () => {
    jest.useFakeTimers()
    jest.setSystemTime(new Date("2026-01-21"))

    const dailyData = {
      ...daysOfConstantDiff(1, 7, { consumed: 2000, expended: 2100 }), // diff +100/day
      ...daysOfConstantDiff(8, 14, { consumed: 2500, expended: 2000 }), // diff -500/day
      ...daysOfConstantDiff(15, 21, { consumed: 2000, expended: 3000 }), // diff +1000/day
    }
    renderWithData(dailyData)

    expect(screen.getByRole("img", { name: "21 Jan: 15,487" })).toHaveClass(
      "week-lowest",
    )
    expect(screen.getByRole("img", { name: "7 Jan: 18,987" })).not.toHaveClass(
      "week-lowest",
    )
    expect(screen.getByRole("img", { name: "14 Jan: 22,487" })).not.toHaveClass(
      "week-lowest",
    )

    jest.useRealTimers()
  })
})
