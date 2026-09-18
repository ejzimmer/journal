import { render, screen } from "@testing-library/react"
import { WeeklyCalorieTracker } from "./WeeklyCalorieTracker"
import { Balance } from "../utils"

const firstDay = Temporal.PlainDate.from("2026-01-01")
const mockDays: Balance[] = Array.from({ length: 18 }).map((_, index) => {
  const thisDay = firstDay.add({ days: index })
  return {
    id: thisDay.toString(),
    day: thisDay.day,
    month: "Jan",
    monthNumber: thisDay.month,
    dayOfWeek: thisDay.dayOfWeek,
    balance: 20000,
  }
})

describe("WeeklyCalorieTracker", () => {
  it("doesn't show a duplicate bar when today completes a week", () => {
    render(<WeeklyCalorieTracker days={mockDays.slice(0, 7)} />)

    const bars = screen.getAllByText(/^\d+ Jan: /)
    expect(bars).toHaveLength(1)
  })

  it("shows a bar for every week, including the current, incomplete week", () => {
    render(<WeeklyCalorieTracker days={mockDays} />)

    const bars = screen.getAllByText(/^\d+ Jan: /)
    expect(bars).toHaveLength(3)
  })

  it("marks the highest calorie week", () => {
    const higherDay = { ...mockDays.at(13), balance: 30000 } as Balance
    render(<WeeklyCalorieTracker days={mockDays.with(13, higherDay)} />)

    expect(screen.getByRole("img", { name: "14 Jan: 30,000" })).toHaveClass(
      "week-highest",
    )

    jest.useRealTimers()
  })

  it("marks the lowest calorie week", () => {
    const higherDay = { ...mockDays.at(13), balance: 10000 } as Balance
    render(<WeeklyCalorieTracker days={mockDays.with(13, higherDay)} />)

    expect(screen.getByRole("img", { name: "14 Jan: 10,000" })).toHaveClass(
      "week-lowest",
    )
  })
})
