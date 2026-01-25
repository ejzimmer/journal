import { render, screen } from "@testing-library/react"
import { Day } from "./Day"
import userEvent from "@testing-library/user-event"
import { ContextType, FirebaseContext } from "../../../shared/FirebaseContext"
import { ReactNode } from "react"
import { HABITS } from "./types"

const Wrapper = ({
  children,
  overrides,
}: {
  children: ReactNode
  overrides?: Partial<ContextType>
}) => (
  <FirebaseContext.Provider value={overrides ?? ({} as any)}>
    {children}
  </FirebaseContext.Provider>
)

const minimalProps = {
  path: "2026/daily",
  date: { day: 12, month: "Jan" },
  id: "12Jan",
}

const commonProps = {
  ...minimalProps,
  consumed: 1200,
  expended: 1500,
  balance: 20028,
  habits: ["🇫🇷"],
  trackers: ["🥡", "🥡", "🤕"],
}

describe("Day", () => {
  it("shows the date", () => {
    render(<Day {...minimalProps} />, {
      wrapper: Wrapper,
    })

    expect(screen.getByRole("heading", { name: "12 Jan" })).toBeInTheDocument()
  })
  describe("when there is no information available", () => {
    it("shows the form", () => {
      render(<Day {...minimalProps} />, {
        wrapper: Wrapper,
      })

      expect(
        screen.getByRole("textbox", { name: "consumed" })
      ).toBeInTheDocument()
      expect(
        screen.getByRole("textbox", { name: "expended" })
      ).toBeInTheDocument()
      expect(
        screen.queryByRole("button", { name: "Cancel" })
      ).not.toBeInTheDocument()
    })
  })

  describe("when the balance is available", () => {
    it("shows the net calories & trackers", () => {
      render(<Day {...commonProps} />, { wrapper: Wrapper })

      expect(screen.queryByRole("textbox")).not.toBeInTheDocument()
      expect(screen.getByText(20028)).toBeInTheDocument()

      HABITS.forEach((habit) => {
        const checkbox = screen.getByRole<HTMLInputElement>("checkbox", {
          name: habit,
        })
        expect(checkbox).toBeInTheDocument()
        expect(checkbox.checked).toBe(habit === "🇫🇷")
      })

      expect(screen.getAllByRole("button", { name: "delete 🥡" })).toHaveLength(
        2
      )
      expect(
        screen.getByRole("combobox", { name: "add tracker" })
      ).toBeInTheDocument()
    })

    describe("and the user clicks the calorie number", () => {
      it("brings back the form", async () => {
        const user = userEvent.setup()
        render(<Day {...commonProps} />, { wrapper: Wrapper })

        const netCalories = screen.getByText("20028")
        await user.click(netCalories)

        expect(netCalories).not.toBeInTheDocument()
        const consumed = screen.getByRole("textbox", { name: "consumed" })
        expect(consumed).toHaveValue("1200")
        const expended = screen.getByRole("textbox", { name: "expended" })
        expect(expended).toHaveValue("1500")
      })
    })
  })

  describe("when a tracker appears twice & the user clicks remove", () => {
    it("only removes one", async () => {
      const user = userEvent.setup()
      const updateItem = jest.fn()
      render(<Day {...commonProps} />, {
        wrapper: ({ children }) => (
          <Wrapper overrides={{ updateItem }}>{children}</Wrapper>
        ),
      })

      await user.click(screen.getAllByRole("button", { name: "delete 🥡" })[0])

      const { path, date, balance, ...dayData } = commonProps
      expect(updateItem).toHaveBeenCalledWith(path, {
        ...dayData,
        trackers: ["🥡", "🤕"],
      })
    })
  })
})
