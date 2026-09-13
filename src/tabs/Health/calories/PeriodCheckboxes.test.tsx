import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { PeriodCheckboxes } from "./PeriodCheckboxes"

describe("PeriodCheckboxes", () => {
  it("shows a checkbox for each tracker in a single row, checked to match the given trackers", () => {
    render(<PeriodCheckboxes trackers={["🔴"]} onChange={jest.fn()} />)

    const checkboxes = screen.getAllByRole("checkbox")
    expect(checkboxes).toHaveLength(3)

    expect(screen.getByRole("checkbox", { name: "light flow" })).not.toBeChecked()
    expect(screen.getByRole("checkbox", { name: "heavy flow" })).toBeChecked()
    expect(screen.getByRole("checkbox", { name: "ovary pain" })).not.toBeChecked()
  })

  it("adds a tracker when its checkbox is checked", async () => {
    const user = userEvent.setup()
    const onChange = jest.fn()
    render(<PeriodCheckboxes trackers={[]} onChange={onChange} />)

    await user.click(screen.getByRole("checkbox", { name: "light flow" }))

    expect(onChange).toHaveBeenCalledWith(["🟤"])
  })

  it("removes a tracker when its checkbox is unchecked", async () => {
    const user = userEvent.setup()
    const onChange = jest.fn()
    render(<PeriodCheckboxes trackers={["🟤", "🥚"]} onChange={onChange} />)

    await user.click(screen.getByRole("checkbox", { name: "ovary pain" }))

    expect(onChange).toHaveBeenCalledWith(["🟤"])
  })
})
