import { render, screen, within } from "@testing-library/react"
import { DayList } from "./DayList"
import { FirebaseContext } from "../../../shared/FirebaseContext"
import { ReactNode } from "react"

function Wrapper({ children }: { children: ReactNode }) {
  return (
    <FirebaseContext.Provider
      value={{
        addItem: jest.fn(),
        updateItem: jest.fn(),
        deleteItem: jest.fn(),
        updateList: jest.fn(),
        useValue: jest.fn().mockReturnValue({ loading: false }),
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
})
