import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { Days } from "./Days"
import { Balance } from "../utils"

const firstDay = Temporal.PlainDate.from("2026-01-01")
const mockDays: Balance[] = Array.from({ length: 20 }).map((_, index) => {
  const thisDay = firstDay.add({ days: index })
  return {
    id: thisDay.toString(),
    day: thisDay.day,
    month: "Jan",
    monthNumber: thisDay.month,
    dayOfWeek: thisDay.dayOfWeek,
  }
})

describe("Days", () => {
  it("shows a circle for every day so far this year except today, starting on the correct day", () => {
    render(<Days days={mockDays} onSelectDay={jest.fn()} />)

    expect(screen.getAllByRole("listitem")).toHaveLength(20)

    // 1 Jan 2026 is a Thursday
    expect(screen.getByRole("list", { name: "by day" })).toHaveStyle({
      "--starting-index": "4",
    })
  })

  it("calls onSelectDay with the day's id when a dot is clicked", async () => {
    const user = userEvent.setup()
    const onSelectDay = jest.fn()
    render(<Days days={mockDays} onSelectDay={onSelectDay} />)

    const dots = screen.getAllByRole("button", { name: /^update / })
    expect(dots).toHaveLength(20)

    await user.click(screen.getByRole("button", { name: "update 5 Jan" }))

    expect(onSelectDay).toHaveBeenCalledWith("2026-01-05")
  })

  it("doesn't show any period icons for a day with no trackers", () => {
    render(<Days days={mockDays} onSelectDay={jest.fn()} />)

    expect(screen.queryByRole("img", { name: "light flow" })).not.toBeInTheDocument()
    expect(screen.queryByRole("img", { name: "heavy flow" })).not.toBeInTheDocument()
    expect(screen.queryByRole("img", { name: "ovary pain" })).not.toBeInTheDocument()
  })

  it("shows a single drop for light flow, two drops for heavy flow, and a lightning bolt for ovary pain", () => {
    const days: Balance[] = mockDays.map((day) =>
      day.day === 5
        ? { ...day, trackers: ["🟤"] }
        : day.day === 6
          ? { ...day, trackers: ["🔴"] }
          : day.day === 7
            ? { ...day, trackers: ["🥚"] }
            : day,
    )
    render(<Days days={days} onSelectDay={jest.fn()} />)

    expect(screen.getByRole("img", { name: "light flow" })).toBeInTheDocument()
    expect(screen.getByRole("img", { name: "heavy flow" })).toBeInTheDocument()
    expect(screen.getByRole("img", { name: "ovary pain" })).toBeInTheDocument()
  })

  it("shows both a flow icon and the ovary pain icon on the same day", () => {
    const days: Balance[] = mockDays.map((day) =>
      day.day === 5 ? { ...day, trackers: ["🔴", "🥚"] } : day,
    )
    render(<Days days={days} onSelectDay={jest.fn()} />)

    expect(screen.getByRole("img", { name: "heavy flow" })).toBeInTheDocument()
    expect(screen.getByRole("img", { name: "ovary pain" })).toBeInTheDocument()
  })

  it("ignores trackers that aren't period-related", () => {
    const days: Balance[] = mockDays.map((day) =>
      day.day === 5 ? { ...day, trackers: ["🧘"] } : day,
    )
    render(<Days days={days} onSelectDay={jest.fn()} />)

    expect(screen.queryByRole("img")).not.toBeInTheDocument()
  })
})
