import { render, screen, within } from "@testing-library/react"
import { DayList } from "./DayList"
import { DayData } from "../../../shared/types"
import { ReactNode } from "react"
import { StorageContextWrapper } from "../../../shared/storageContextTestUtils"

function Wrapper({
  children,
  dailyData,
}: {
  children: ReactNode
  dailyData?: Record<string, DayData>
}) {
  return (
    <StorageContextWrapper
      value={{
        useValue: jest.fn().mockReturnValue({ loading: false, value: dailyData }),
      }}
    >
      {children}
    </StorageContextWrapper>
  )
}

describe("Days", () => {
  it("displays an element for every day of the year", () => {
    jest.useFakeTimers()
    jest.setSystemTime(new Date("2026-03-12"))
    render(<DayList />, { wrapper: Wrapper })

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

    render(<DayList />, {
      wrapper: (props) => <Wrapper {...props} dailyData={dailyData} />,
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

    render(<DayList />, {
      wrapper: (props) => <Wrapper {...props} dailyData={dailyData} />,
    })

    const bars = screen.getAllByText(/^\d+ Jan: /)
    expect(bars).toHaveLength(2)

    jest.useRealTimers()
  })
})
