import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { ReactNode } from "react"
import { Calories } from "./Calories"
import { FirebaseContext } from "../../../shared/FirebaseContext"
import { createMockFirebaseContext } from "../../../shared/mockFirebase"
import { DAILY_PATH, DayData } from "../../../shared/types"

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

function renderCalories(dailyData?: Record<string, DayData>) {
  return render(<Calories />, {
    wrapper: (props) => <Wrapper {...props} dailyData={dailyData} />,
  })
}

describe("Calories", () => {
  beforeEach(() => {
    jest.useFakeTimers()
    // yesterday is 6 Jan
    jest.setSystemTime(new Date("2026-01-07"))
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  describe("add calories form", () => {
    it("shows the form when no calories have been recorded for yesterday", () => {
      renderCalories()

      expect(
        screen.getByRole("textbox", { name: "In" }),
      ).toBeInTheDocument()
      expect(
        screen.getByRole("textbox", { name: "Out" }),
      ).toBeInTheDocument()
    })

    it("doesn't show the form when yesterday's calories are already recorded", () => {
      renderCalories({
        "2026-01-06": { id: "2026-01-06", consumed: 1800, expended: 2200 },
      })

      expect(
        screen.queryByRole("textbox", { name: "In" }),
      ).not.toBeInTheDocument()
    })

    it("shows the form when yesterday has an entry but calories haven't been recorded yet", () => {
      renderCalories({
        "2026-01-06": { id: "2026-01-06", habits: { "🧘": true } } as DayData,
      })

      expect(
        screen.getByRole("textbox", { name: "In" }),
      ).toBeInTheDocument()
    })

    it("dismisses the form without saving anything", async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime })
      const updateItem = jest.fn()
      render(<Calories />, {
        wrapper: ({ children }) => (
          <FirebaseContext.Provider
            value={{
              addItem: jest.fn(),
              updateItem,
              deleteItem: jest.fn(),
              updateList: jest.fn(),
              useValue: jest.fn().mockReturnValue({ loading: false, value: undefined }),
            }}
          >
            {children}
          </FirebaseContext.Provider>
        ),
      })

      await user.click(screen.getByRole("button", { name: "dismiss" }))

      expect(
        screen.queryByRole("textbox", { name: "In" }),
      ).not.toBeInTheDocument()
      expect(updateItem).not.toHaveBeenCalled()
    })

    it("saves consumed and expended for yesterday, and hides the form once saved", async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime })
      const storageContext = createMockFirebaseContext({ [DAILY_PATH]: {} })

      render(
        <FirebaseContext.Provider value={storageContext}>
          <Calories />
        </FirebaseContext.Provider>,
      )

      await user.type(screen.getByRole("textbox", { name: "In" }), "1800")
      await user.type(screen.getByRole("textbox", { name: "Out" }), "2200{Enter}")

      expect(
        screen.queryByRole("textbox", { name: "In" }),
      ).not.toBeInTheDocument()
    })
  })
})
