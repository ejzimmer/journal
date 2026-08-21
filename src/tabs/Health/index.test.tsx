import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { ReactNode } from "react"
import { Health } from "."
import { FirebaseContext } from "../../shared/FirebaseContext"

function Wrapper({ children }: { children: ReactNode }) {
  return (
    <FirebaseContext.Provider
      value={{
        addItem: jest.fn(),
        updateItem: jest.fn(),
        deleteItem: jest.fn(),
        updateList: jest.fn(),
        useValue: jest.fn().mockReturnValue({ loading: false, value: undefined }),
      }}
    >
      {children}
    </FirebaseContext.Provider>
  )
}

describe("Health", () => {
  beforeEach(() => {
    jest.useFakeTimers()
    jest.setSystemTime(new Date("2026-01-07"))
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it("shows the weekly tracker by default, and switches to the daily view on toggle", async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime })
    render(<Health />, { wrapper: Wrapper })

    expect(screen.getByTestId("weekly-pane")).toHaveAttribute("aria-hidden", "false")
    expect(screen.getByTestId("daily-pane")).toHaveAttribute("aria-hidden", "true")

    await user.click(screen.getByRole("radio", { name: "日" }))

    expect(screen.getByTestId("weekly-pane")).toHaveAttribute("aria-hidden", "true")
    expect(screen.getByTestId("daily-pane")).toHaveAttribute("aria-hidden", "false")
  })

  it("switches back to the weekly view", async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime })
    render(<Health />, { wrapper: Wrapper })

    await user.click(screen.getByRole("radio", { name: "日" }))
    await user.click(screen.getByRole("radio", { name: "週" }))

    expect(screen.getByTestId("weekly-pane")).toHaveAttribute("aria-hidden", "false")
    expect(screen.getByTestId("daily-pane")).toHaveAttribute("aria-hidden", "true")
  })
})
