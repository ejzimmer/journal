import { render, screen } from "@testing-library/react"
import { DeleteTaskButton } from "./DeleteTaskButton"
import userEvent from "@testing-library/user-event"

describe("DeleteTaskButton", () => {
  it("deletes the task", async () => {
    const user = userEvent.setup()
    const onDelete = jest.fn()
    render(
      <DeleteTaskButton taskDescription="Buy fabric" onDelete={onDelete} />
    )

    await user.click(screen.getByRole("button", { name: "Delete Buy fabric" }))
    await user.click(screen.getByRole("button", { name: "Delete task" }))

    expect(onDelete).toHaveBeenCalled()
  })
})
