import { act, fireEvent, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { format, parse } from "date-fns"
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

const flushAnimationFrame = () =>
  act(
    () =>
      new Promise((resolve) => requestAnimationFrame(() => resolve(undefined))),
  )

const addLabel = async (
  user: ReturnType<typeof userEvent.setup>,
  value: string,
) => {
  await user.click(screen.getByRole("button", { name: "Add label" }))
  await user.type(
    screen.getByRole("combobox", { name: "Labels" }),
    `${value}{Enter}`,
  )
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

  it("doesn't submit the task when the due date and label controls are opened", async () => {
    const user = userEvent.setup()
    const onSubmit = jest.fn()
    const onClose = jest.fn()
    render(<AddTaskForm onSubmit={onSubmit} onClose={onClose} />, {
      wrapper: Wrapper,
    })

    const descriptionInput = screen.getByRole("textbox", {
      name: "Description",
    })
    await user.type(descriptionInput, "Approve PR")
    await user.click(screen.getByRole("button", { name: "📅" }))
    await user.click(screen.getByRole("button", { name: "Add label" }))

    expect(onSubmit).not.toHaveBeenCalled()
    expect(onClose).not.toHaveBeenCalled()
  })

  it("stays open when the user clicks outside it", async () => {
    const user = userEvent.setup()
    const onClose = jest.fn()
    render(<AddTaskForm {...commonProps} onClose={onClose} />, {
      wrapper: Wrapper,
    })

    await user.click(document.body)
    await flushAnimationFrame()

    expect(onClose).not.toHaveBeenCalled()
    expect(
      screen.getByRole("textbox", { name: "Description" }),
    ).toBeInTheDocument()
  })

  it("returns focus to the add label button when the label picker closes", async () => {
    const user = userEvent.setup()
    render(<AddTaskForm {...commonProps} />, { wrapper: Wrapper })

    await addLabel(user, "PR")

    expect(screen.getByRole("button", { name: "Add label" })).toHaveFocus()
  })

  it("returns focus to the due date when the date input closes", async () => {
    const user = userEvent.setup()
    render(<AddTaskForm {...commonProps} />, { wrapper: Wrapper })

    await setDueDate(user, "2026-01-01")

    expect(screen.getByText("01 Jan")).toHaveFocus()
  })

  it("abandons the date edit, not the form, when Escape closes the date input", async () => {
    const user = userEvent.setup()
    const onClose = jest.fn()
    render(<AddTaskForm {...commonProps} onClose={onClose} />, {
      wrapper: Wrapper,
    })

    const today = new Date()
    await user.click(screen.getByRole("button", { name: "📅" }))
    await user.click(screen.getByText(format(today, "dd MMM")))
    // Testing library doesn't handle date inputs well
    fireEvent.change(screen.getByLabelText("Due date"), {
      target: { value: "2026-01-01" },
    })
    await user.keyboard("{Escape}")

    expect(onClose).not.toHaveBeenCalled()
    expect(screen.queryByLabelText("Due date")).not.toBeInTheDocument()

    await user.click(screen.getByText(format(today, "dd MMM")))

    expect(screen.getByLabelText("Due date")).toHaveValue(
      format(today, "yyyy-MM-dd"),
    )
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
