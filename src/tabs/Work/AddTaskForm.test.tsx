import { fireEvent, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { parse } from "date-fns"
import { AddTaskForm } from "./AddTaskForm"
import { WorkStorageContext } from "./WorkStorageContext"
import { createWorkStorageContext } from "./workStorageTestUtils"

const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <WorkStorageContext.Provider value={createWorkStorageContext()}>
    {children}
  </WorkStorageContext.Provider>
)

const commonProps = {
  onSubmit: jest.fn(),
  onClose: jest.fn(),
}

const setDueDate = async (
  user: ReturnType<typeof userEvent.setup>,
  date: string,
) => {
  await user.click(screen.getByRole("button", { name: "📅" }))
  await user.click(screen.getByText(/\d\d \w\w\w/))
  // Testing library doesn't handle date inputs well
  fireEvent.change(screen.getByLabelText("Due date"), {
    target: { value: date },
  })
  await user.keyboard("{Enter}")
}

const addLabel = async (
  user: ReturnType<typeof userEvent.setup>,
  value: string,
) => {
  await user.click(screen.getByRole("button", { name: "Add label" }))
  await user.type(screen.getByRole("combobox"), `${value}{Enter}`)
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
      labels: [],
    })
  })

  it("doesn't add a task with no description", async () => {
    const user = userEvent.setup()
    const onSubmit = jest.fn()
    render(<AddTaskForm {...commonProps} onSubmit={onSubmit} />, {
      wrapper: Wrapper,
    })

    await setDueDate(user, "2026-01-01")
    await user.click(screen.getByRole("button", { name: "submit" }))

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
    await setDueDate(user, "2026-01-01")
    await user.click(screen.getByRole("button", { name: "submit" }))

    expect(onSubmit).toHaveBeenCalledWith({
      description: "Approve PR",
      dueDate: parse("2026-01-01", "yyyy-MM-dd", new Date()).getTime(),
      labels: [],
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
    await addLabel(user, "PR")
    await user.click(screen.getByRole("button", { name: "submit" }))

    expect(onSubmit).toHaveBeenCalledWith({
      description: "Approve PR",
      labels: [{ value: "PR", colour: "blue" }],
    })
  })

  it("removes a label before the task is added", async () => {
    const user = userEvent.setup()
    const onSubmit = jest.fn()
    render(<AddTaskForm {...commonProps} onSubmit={onSubmit} />, {
      wrapper: Wrapper,
    })

    const descriptionInput = screen.getByRole("textbox", {
      name: "Description",
    })
    await user.type(descriptionInput, "Approve PR")
    await addLabel(user, "PR")
    await user.click(screen.getByRole("button", { name: "Remove PR" }))
    await user.click(screen.getByRole("button", { name: "submit" }))

    expect(onSubmit).toHaveBeenCalledWith({
      description: "Approve PR",
      labels: [],
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
      await user.keyboard("{Escape}")

      expect(onCancel).toHaveBeenCalled()
    })
  })
})
