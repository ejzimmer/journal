import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { AddWorktree } from "./AddWorktree"

describe("AddWorktree", () => {
  it("renders the add button, shows the options when clicked, and calls onChange with the chosen worktree", async () => {
    const user = userEvent.setup()
    const onChange = jest.fn()
    render(<AddWorktree onChange={onChange} />)

    await user.click(screen.getByRole("button", { name: "Add worktree stamp" }))

    ;["WT1", "WT2", "WT3", "WT4"].forEach((worktree) => {
      expect(
        screen.getByRole("button", {
          name: `Add ${worktree} stamp`,
          hidden: true,
        }),
      ).toBeInTheDocument()
    })

    await user.click(
      screen.getByRole("button", { name: "Add WT3 stamp", hidden: true }),
    )

    expect(onChange).toHaveBeenCalledWith("wt3")
  })
})
