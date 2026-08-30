import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { ReactNode } from "react"
import { Calories } from "./Calories"
import { FirebaseContext } from "../../../shared/FirebaseContext"
import { createMockFirebaseContext } from "../../../shared/mockFirebase"
import { renderWithStorage } from "../../../shared/storageContextTestUtils"
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
        setValue: jest.fn(),
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
              setValue: jest.fn(),
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

  describe("editing an existing day", () => {
    it("opens the form pre-populated with that day's values when its dot is clicked, and updates it on submit", async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime })
      const updateItem = jest.fn()
      const dailyData = {
        "2026-01-03": { id: "2026-01-03", consumed: 1500, expended: 2000 },
        "2026-01-06": { id: "2026-01-06", consumed: 1800, expended: 2200 },
      }

      renderWithStorage(<Calories />, {
        value: {
          updateItem,
          useValue: jest
            .fn()
            .mockReturnValue({ loading: false, value: dailyData }),
        },
      })

      await user.click(screen.getByRole("radio", { name: "日" }))
      await user.click(screen.getByRole("button", { name: "update 3 Jan" }))

      expect(screen.getByRole("heading", { name: "3 Jan" })).toBeInTheDocument()
      expect(screen.getByRole("textbox", { name: "In" })).toHaveValue("1500")
      expect(screen.getByRole("textbox", { name: "Out" })).toHaveValue("2000")

      await user.clear(screen.getByRole("textbox", { name: "In" }))
      await user.type(screen.getByRole("textbox", { name: "In" }), "1600")
      await user.clear(screen.getByRole("textbox", { name: "Out" }))
      await user.type(screen.getByRole("textbox", { name: "Out" }), "2100{Enter}")

      expect(updateItem).toHaveBeenCalledWith(
        DAILY_PATH,
        expect.objectContaining({
          id: "2026-01-03",
          consumed: 1600,
          expended: 2100,
        }),
      )
    })

    it("switches to the newly clicked day's form when another dot is clicked while a form is already open", async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime })
      const dailyData = {
        "2026-01-02": { id: "2026-01-02", consumed: 1200, expended: 2600 },
        "2026-01-06": { id: "2026-01-06", consumed: 1800, expended: 2200 },
      }

      renderWithStorage(<Calories />, {
        value: {
          useValue: jest
            .fn()
            .mockReturnValue({ loading: false, value: dailyData }),
        },
      })

      await user.click(screen.getByRole("radio", { name: "日" }))
      await user.click(screen.getByRole("button", { name: "update 2 Jan" }))

      expect(screen.getByRole("heading", { name: "2 Jan" })).toBeInTheDocument()
      expect(screen.getByRole("textbox", { name: "In" })).toHaveValue("1200")

      await user.click(screen.getByRole("button", { name: "update 4 Jan" }))

      expect(screen.getByRole("heading", { name: "4 Jan" })).toBeInTheDocument()
      expect(
        screen.queryByRole("heading", { name: "2 Jan" }),
      ).not.toBeInTheDocument()
      expect(screen.getByRole("textbox", { name: "In" })).toHaveValue("")
    })
  })

  describe("period tracking", () => {
    it("shows the period icon for a day that has tracker data", async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime })
      const dailyData = {
        "2026-01-03": {
          id: "2026-01-03",
          consumed: 1500,
          expended: 2000,
          trackers: ["🔴"],
        },
      }

      renderWithStorage(<Calories />, {
        value: {
          useValue: jest
            .fn()
            .mockReturnValue({ loading: false, value: dailyData }),
        },
      })

      await user.click(screen.getByRole("radio", { name: "日" }))

      expect(screen.getByRole("img", { name: "heavy flow" })).toBeInTheDocument()
    })
  })
})
