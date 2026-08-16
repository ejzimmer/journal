import { render, screen, within } from "@testing-library/react"
import { DayList } from "./DayList"
import { FirebaseContext } from "../../../shared/FirebaseContext"
import { DayData } from "../../../shared/types"
import { ReactNode } from "react"

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

  it("highlights the highest and lowest weekly bars", () => {
    jest.useFakeTimers()
    jest.setSystemTime(new Date("2026-01-14"))

    const dailyData: Record<string, DayData> = {}
    for (let day = 1; day <= 7; day += 1) {
      dailyData[`${day}Jan`] = { id: `${day}Jan`, consumed: 2000, expended: 2500 }
    }
    for (let day = 8; day <= 14; day += 1) {
      dailyData[`${day}Jan`] = { id: `${day}Jan`, consumed: 2500, expended: 2000 }
    }

    const { container } = render(<DayList />, {
      wrapper: (props) => <Wrapper {...props} dailyData={dailyData} />,
    })

    // no accessible role/text distinguishes the highest/lowest bars from the
    // rest, so a container query is the only way to check the CSS class
    // eslint-disable-next-line testing-library/no-container, testing-library/no-node-access
    expect(container.querySelectorAll(".week-highest")).toHaveLength(1)
    // eslint-disable-next-line testing-library/no-container, testing-library/no-node-access
    expect(container.querySelectorAll(".week-lowest")).toHaveLength(1)

    jest.useRealTimers()
  })
})
