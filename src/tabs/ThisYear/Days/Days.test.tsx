import { render, screen } from "@testing-library/react"
import { DayList } from "./DayList"

describe("Days", () => {
  it("displays an element for every day of the year", () => {
    jest.useFakeTimers()
    jest.setSystemTime(new Date("2026-03-12"))
    render(<DayList />)

    const numberOfDays = 31 + 28 + 12
    const days = screen.getAllByRole("listitem")

    expect(days).toHaveLength(numberOfDays)

    jest.useRealTimers()
  })
})
