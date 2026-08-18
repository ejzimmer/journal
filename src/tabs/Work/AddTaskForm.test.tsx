import { fireEvent, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { AddTaskForm } from "./AddTaskForm"
import { WorkStorageContext } from "./WorkStorageContext"
import { createWorkStorageContext } from "./workStorageTestUtils"

const resolveLabel = ({ value }: { value: string }) => `id-${value}`

const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <WorkStorageContext.Provider
    value={createWorkStorageContext({ resolveLabel })}
  >
    {children}
  </WorkStorageContext.Provider>
)

const commonProps = {
  onSubmit: jest.fn(),
  onClose: jest.fn(),
}

describe("AddTaskForm", () => {
  it("adds a task with just a description", async () => {
    const user = userEvent.setup()
    const onSubmit = jest.fn()
    render(<AddTaskForm {...commonProps} onSubmit={onSubmit} />, {
      wrapper: Wrapper,
    })

    const descriptionInput = screen.getByRole("textbox", {
      name: "Description",
    })
    await user.type(descriptionInput, "Approve PR")
    await user.keyboard("{Enter}")

    expect(onSubmit).toHaveBeenCalledWith({
      description: "Approve PR",
      labelIds: [],
    })
  })

  it("doesn't add a task with no description", async () => {
    const user = userEvent.setup()
    const onSubmit = jest.fn()
    render(<AddTaskForm {...commonProps} onSubmit={onSubmit} />, {
      wrapper: Wrapper,
    })

    // Testing library doesn't handle date inputs well
    const dateInput = screen.getByLabelText("Due date")
    fireEvent.change(dateInput, { target: { value: "2026-01-01" } })

    await user.keyboard("{Enter}")

    expect(onSubmit).not.toHaveBeenCalled()
  })

  it("adds a task with a due date and a description", async () => {
    const user = userEvent.setup()
    const onSubmit = jest.fn()
    render(<AddTaskForm {...commonProps} onSubmit={onSubmit} />, {
      wrapper: Wrapper,
    })

    const descriptionInput = screen.getByRole("textbox", {
      name: "Description",
    })
    await user.type(descriptionInput, "Approve PR")
    // Testing library doesn't handle date inputs well
    const dateInput = screen.getByLabelText("Due date")
    fireEvent.change(dateInput, { target: { value: "2026-01-01" } })
    await user.keyboard("{Enter}")

    expect(onSubmit).toHaveBeenCalledWith({
      description: "Approve PR",
      dueDate: new Date("2026-01-01").getTime(),
      labelIds: [],
    })
  })

  it("adds a task with labels", async () => {
    const user = userEvent.setup()
    const onSubmit = jest.fn()
    render(<AddTaskForm {...commonProps} onSubmit={onSubmit} />, {
      wrapper: Wrapper,
    })

    const descriptionInput = screen.getByRole("textbox", {
      name: "Description",
    })
    await user.type(descriptionInput, "Approve PR")
    const labelInput = screen.getByRole("combobox", { name: "Labels" })
    await user.type(labelInput, "PR{Enter}")
    await user.click(screen.getByRole("button", { name: "submit" }))

    expect(onSubmit).toHaveBeenCalledWith({
      description: "Approve PR",
      labelIds: ["id-PR"],
    })
  })

  describe("when the user presses the Escape key", () => {
    it("call onCancel", async () => {
      const user = userEvent.setup()
      const onCancel = jest.fn()
      render(<AddTaskForm {...commonProps} onClose={onCancel} />, {
        wrapper: Wrapper,
      })

      const descriptionInput = screen.getByRole("textbox", {
        name: "Description",
      })
      await user.type(descriptionInput, "Approve PR")
      // Testing library doesn't handle date inputs well
      const dateInput = screen.getByLabelText("Due date")
      fireEvent.change(dateInput, { target: { value: "2026-01-01" } })
      await user.keyboard("{Escape}")

      expect(onCancel).toHaveBeenCalled()
    })
  })
})
