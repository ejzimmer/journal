import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { WorktreeStamp } from "./WorktreeStamp"

describe("WorktreeStamp", () => {
  it("shows the current worktree on the trigger", () => {
    render(<WorktreeStamp worktree="wt-2" onChange={jest.fn()} />)

    expect(
      screen.getByRole("button", { name: "Change worktree, currently WT-2" }),
    ).toBeInTheDocument()
  })

  it("offers the other three worktrees and a remove option", () => {
    render(<WorktreeStamp worktree="wt-2" onChange={jest.fn()} />)

    expect(
      screen.getByRole("button", { name: "Move to WT-1", hidden: true }),
    ).toBeInTheDocument()
    expect(
      screen.queryByRole("button", { name: "Move to WT-2", hidden: true }),
    ).not.toBeInTheDocument()
    expect(
      screen.getByRole("button", { name: "Move to WT-3", hidden: true }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole("button", { name: "Move to WT-4", hidden: true }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole("button", {
        name: "Remove worktree stamp",
        hidden: true,
      }),
    ).toBeInTheDocument()
  })

  it("calls onChange with the new worktree when an option is clicked", async () => {
    const user = userEvent.setup()
    const onChange = jest.fn()
    render(<WorktreeStamp worktree="wt-2" onChange={onChange} />)

    await user.click(
      screen.getByRole("button", { name: "Move to WT-3", hidden: true }),
    )

    expect(onChange).toHaveBeenCalledWith("wt-3")
  })

  it("calls onChange with undefined when remove is clicked", async () => {
    const user = userEvent.setup()
    const onChange = jest.fn()
    render(<WorktreeStamp worktree="wt-2" onChange={onChange} />)

    await user.click(
      screen.getByRole("button", {
        name: "Remove worktree stamp",
        hidden: true,
      }),
    )

    expect(onChange).toHaveBeenCalledWith(undefined)
  })
})
