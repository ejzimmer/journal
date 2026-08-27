import { render, screen } from "@testing-library/react"
import { Days } from "./Days"
import { Balance } from "../utils"

const firstDay = Temporal.PlainDate.from("2026-01-01")
const mockDays: Balance[] = Array.from({ length: 20 }).map((_, index) => {
  const thisDay = firstDay.add({ days: index })
  return {
    day: thisDay.day,
    month: "Jan",
    monthNumber: thisDay.month,
    dayOfWeek: thisDay.dayOfWeek,
  }
})

describe("Days", () => {
  it("shows a circle for every day so far this year except today, starting on the correct day", () => {
    render(<Days days={mockDays} />)

    expect(screen.getAllByRole("listitem")).toHaveLength(20)

    // 1 Jan 2026 is a Thursday
    expect(screen.getByRole("list", { name: "by day" })).toHaveStyle({
      "--starting-index": "4",
    })
  })
})
