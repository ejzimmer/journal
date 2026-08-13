import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { AddWorktree } from "./AddWorktree"

describe("AddWorktree", () => {
  it("shows an add button", () => {
    render(<AddWorktree onChange={jest.fn()} />)

    expect(
      screen.getByRole("button", { name: "Add worktree stamp" }),
    ).toBeInTheDocument()
  })

  it("offers all four worktrees", () => {
    render(<AddWorktree onChange={jest.fn()} />)

    ;["WT-1", "WT-2", "WT-3", "WT-4"].forEach((worktree) => {
      expect(
        screen.getByRole("button", {
          name: `Add ${worktree} stamp`,
          hidden: true,
        }),
      ).toBeInTheDocument()
    })
  })

  it("calls onChange with the chosen worktree", async () => {
    const user = userEvent.setup()
    const onChange = jest.fn()
    render(<AddWorktree onChange={onChange} />)

    await user.click(
      screen.getByRole("button", { name: "Add WT-3 stamp", hidden: true }),
    )

    expect(onChange).toHaveBeenCalledWith("wt-3")
  })
})
