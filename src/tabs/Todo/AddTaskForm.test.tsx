import { fireEvent, render, screen } from "@testing-library/react"
import { AddTaskForm, AddTaskFormProps } from "./AddTaskForm"
import userEvent from "@testing-library/user-event"

const commonProps: AddTaskFormProps = {
  onSubmit: jest.fn(),
  categories: [
    { text: "Chore", emoji: "🧹" },
    { text: "Learning", emoji: "📖" },
  ],
}

describe("AddTaskForm", () => {
  it("show the fields relevant to the selected type", async () => {
    const user = userEvent.setup()
    render(<AddTaskForm {...commonProps} />)

    await user.click(screen.getByRole("button", { name: "Add task" }))
    const typeSelect = screen.getByRole("combobox", { name: "Type" })
    expect(
      screen.queryByRole("spinbutton", { name: "Frequency" })
    ).not.toBeInTheDocument()
    expect(screen.queryByLabelText("Due date")).not.toBeInTheDocument()

    await user.selectOptions(typeSelect, "週に")
    expect(
      screen.getByRole("spinbutton", { name: "Frequency" })
    ).toBeInTheDocument()
    expect(screen.queryByLabelText("Due date")).not.toBeInTheDocument()

    await user.selectOptions(typeSelect, "日付")
    expect(
      screen.queryByRole("spinbutton", { name: "Frequency" })
    ).not.toBeInTheDocument()
    expect(screen.getByLabelText("Due date")).toBeInTheDocument()
  })

  it("attempts to submit the form when the enter key is pressed", async () => {
    const user = userEvent.setup()
    render(<AddTaskForm {...commonProps} onSubmit={jest.fn()} />)
    await user.click(screen.getByRole("button", { name: "Add task" }))

    expect(screen.queryByText("Description required")).not.toBeInTheDocument()
    await user.keyboard("{Tab}{Tab}")
    await user.keyboard("{Enter}")

    expect(screen.getByText("Description required")).toBeInTheDocument()
  })

  describe("when the user presses submit without entering a description", () => {
    it("shows a validation error & doesn't submit", async () => {
      const user = userEvent.setup()
      const onSubmit = jest.fn()
      render(<AddTaskForm {...commonProps} onSubmit={onSubmit} />)
      await user.click(screen.getByRole("button", { name: "Add task" }))

      await user.click(screen.getByRole("button", { name: "Create task" }))

      expect(screen.getByText("Description required")).toBeInTheDocument()
      expect(onSubmit).not.toHaveBeenCalled()
    })
  })

  describe("when the user enters a description and presses submit", () => {
    it("submits the task with the correct defaults", async () => {
      const user = userEvent.setup()
      const onSubmit = jest.fn()
      render(<AddTaskForm {...commonProps} onSubmit={onSubmit} />)
      await user.click(screen.getByRole("button", { name: "Add task" }))

      await user.type(
        screen.getByRole("textbox", { name: "Description" }),
        "Exercise"
      )
      await user.click(screen.getByRole("button", { name: "Create task" }))

      expect(onSubmit).toHaveBeenCalledWith({
        description: "Exercise",
        type: "毎日",
        category: { text: "Chore", emoji: "🧹" },
      })
    })
  })

  describe("when the user chooses weekly type", () => {
    it("defaults to frequency of 1", async () => {
      const user = userEvent.setup()
      const onSubmit = jest.fn()
      render(<AddTaskForm {...commonProps} onSubmit={onSubmit} />)
      await user.click(screen.getByRole("button", { name: "Add task" }))

      await user.type(
        screen.getByRole("textbox", { name: "Description" }),
        "Exercise"
      )
      await user.selectOptions(screen.getByRole("combobox", { name: "Type" }), [
        "週に",
      ])
      await user.click(screen.getByRole("button", { name: "Create task" }))

      expect(onSubmit).toHaveBeenCalledWith({
        description: "Exercise",
        type: "週に",
        category: { text: "Chore", emoji: "🧹" },
        frequency: 1,
      })
    })

    describe("and sets a valid frequency", () => {
      it("submits the task with the given frequency", async () => {
        const user = userEvent.setup()
        const onSubmit = jest.fn()
        render(<AddTaskForm {...commonProps} onSubmit={onSubmit} />)
        await user.click(screen.getByRole("button", { name: "Add task" }))

        await user.type(
          screen.getByRole("textbox", { name: "Description" }),
          "Exercise"
        )
        await user.selectOptions(
          screen.getByRole("combobox", { name: "Type" }),
          ["週に"]
        )
        await user.type(
          screen.getByRole("spinbutton", { name: "Frequency" }),
          "4"
        )
        await user.click(screen.getByRole("button", { name: "Create task" }))

        expect(onSubmit).toHaveBeenCalledWith({
          description: "Exercise",
          type: "週に",
          category: { text: "Chore", emoji: "🧹" },
          frequency: 4,
        })
      })
    })
  })

  describe("when the user chooses calendar type", () => {
    describe("and doesn't choose a due date", () => {
      it("shows a validation error an doesn't submit the form", async () => {
        const user = userEvent.setup()
        const onSubmit = jest.fn()
        render(<AddTaskForm {...commonProps} onSubmit={onSubmit} />)
        await user.click(screen.getByRole("button", { name: "Add task" }))

        await user.type(
          screen.getByRole("textbox", { name: "Description" }),
          "Japanese lesson"
        )
        await user.selectOptions(
          screen.getByRole("combobox", { name: "Type" }),
          ["日付"]
        )
        await user.click(screen.getByRole("button", { name: "Create task" }))

        expect(screen.getByText("Due date required")).toBeInTheDocument()
        expect(onSubmit).not.toHaveBeenCalled()
      })
    })

    describe("and chooses a due date", () => {
      it("submits the form", async () => {
        const user = userEvent.setup()
        const onSubmit = jest.fn()
        render(<AddTaskForm {...commonProps} onSubmit={onSubmit} />)
        await user.click(screen.getByRole("button", { name: "Add task" }))

        await user.type(
          screen.getByRole("textbox", { name: "Description" }),
          "Japanese lesson"
        )
        await user.selectOptions(
          screen.getByRole("combobox", { name: "Type" }),
          ["日付"]
        )
        // Testing library doesn't handle date inputs well
        const dateInput = screen.getByLabelText("Due date")
        fireEvent.change(dateInput, { target: { value: "2026-01-01" } })

        await user.click(screen.getByRole("button", { name: "Create task" }))

        expect(onSubmit).toHaveBeenCalledWith({
          description: "Japanese lesson",
          type: "日付",
          category: { text: "Chore", emoji: "🧹" },
          dueDate: expect.any(Number),
        })
      })
    })
  })
})
