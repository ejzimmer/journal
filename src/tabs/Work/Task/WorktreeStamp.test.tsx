import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { WorktreeStamp } from "./WorktreeStamp"

describe("WorktreeStamp", () => {
  it("renders the trigger, shows the other worktrees and a remove option when clicked, and calls onChange when an option is chosen", async () => {
    const user = userEvent.setup()
    const onChange = jest.fn()
    render(<WorktreeStamp worktree="wt2" onChange={onChange} />)

    const trigger = screen.getByRole("button", {
      name: "Change worktree, currently WT2",
    })
    expect(trigger).toBeInTheDocument()

    await user.click(trigger)

    expect(
      screen.getByRole("button", { name: "Move to WT1", hidden: true }),
    ).toBeInTheDocument()
    expect(
      screen.queryByRole("button", { name: "Move to WT2", hidden: true }),
    ).not.toBeInTheDocument()
    expect(
      screen.getByRole("button", { name: "Move to WT3", hidden: true }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole("button", { name: "Move to WT4", hidden: true }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole("button", {
        name: "Remove worktree stamp",
        hidden: true,
      }),
    ).toBeInTheDocument()

    await user.click(
      screen.getByRole("button", { name: "Move to WT3", hidden: true }),
    )

    expect(onChange).toHaveBeenCalledWith("wt3")
  })

  it("calls onChange with undefined when remove is clicked", async () => {
    const user = userEvent.setup()
    const onChange = jest.fn()
    render(<WorktreeStamp worktree="wt2" onChange={onChange} />)

    await user.click(
      screen.getByRole("button", {
        name: "Remove worktree stamp",
        hidden: true,
      }),
    )

    expect(onChange).toHaveBeenCalledWith(undefined)
  })
})
