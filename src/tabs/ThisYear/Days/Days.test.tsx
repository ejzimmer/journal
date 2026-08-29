import { screen, within } from "@testing-library/react"
import { DayList } from "./DayList"
import { DayData } from "../../../shared/types"
import { renderWithStorage } from "../../../shared/storageContextTestUtils"

describe("Days", () => {
  it("displays an element for every day of the year", () => {
    jest.useFakeTimers()
    jest.setSystemTime(new Date("2026-03-12"))
    renderWithStorage(<DayList />, {
      value: { useValue: jest.fn().mockReturnValue({ loading: false }) },
    })

    const numberOfDays = 31 + 28 + 12
    const daysList = screen.getByRole("list", { name: "days" })
    const days = within(daysList).getAllByRole("listitem")

    expect(days).toHaveLength(numberOfDays)

    jest.useRealTimers()
  })

  it("doesn't show a duplicate bar when today completes a week", () => {
    jest.useFakeTimers()
    jest.setSystemTime(new Date("2026-01-07"))

    const dailyData: Record<string, DayData> = {}
    for (let day = 1; day <= 7; day += 1) {
      dailyData[`${day}Jan`] = { id: `${day}Jan`, consumed: 2000, expended: 2500 }
    }

    renderWithStorage(<DayList />, {
      value: {
        useValue: jest.fn().mockReturnValue({ loading: false, value: dailyData }),
      },
    })

    const bars = screen.getAllByText(/^\d+ Jan: /)
    expect(bars).toHaveLength(1)

    jest.useRealTimers()
  })

  it("still shows a bar for the current, incomplete week", () => {
    jest.useFakeTimers()
    jest.setSystemTime(new Date("2026-01-09"))

    const dailyData: Record<string, DayData> = {}
    for (let day = 1; day <= 8; day += 1) {
      dailyData[`${day}Jan`] = { id: `${day}Jan`, consumed: 2000, expended: 2500 }
    }

    renderWithStorage(<DayList />, {
      value: {
        useValue: jest.fn().mockReturnValue({ loading: false, value: dailyData }),
      },
    })

    const bars = screen.getAllByText(/^\d+ Jan: /)
    expect(bars).toHaveLength(2)

    jest.useRealTimers()
  })
})
