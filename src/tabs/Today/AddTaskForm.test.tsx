import { fireEvent, render, screen } from "@testing-library/react"
import { AddTaskForm, AddTaskFormProps } from "./AddTaskForm"
import userEvent from "@testing-library/user-event"

const commonProps: AddTaskFormProps = {
  onSubmit: jest.fn(),
  categories: [
    ["Chore", "🧹"],
    ["Learning", "📖"],
  ],
}

describe("AddTaskForm", () => {
  it("attempts to submit the form when the enter key is pressed", async () => {
    const user = userEvent.setup()
    render(<AddTaskForm {...commonProps} onSubmit={jest.fn()} />)

    expect(screen.queryByText("Description required")).not.toBeInTheDocument()
    await user.keyboard("{Tab}")
    await user.keyboard("{Enter}")

    expect(screen.getByText("Description required")).toBeInTheDocument()
  })

  describe("when the user presses submit without entering a description", () => {
    it("shows a validation error & doesn't submit", async () => {
      const user = userEvent.setup()
      const onSubmit = jest.fn()
      render(<AddTaskForm {...commonProps} onSubmit={onSubmit} />)

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

      await user.type(
        screen.getByRole("textbox", { name: "Description" }),
        "Exercise"
      )
      await user.click(screen.getByRole("button", { name: "Create task" }))

      expect(onSubmit).toHaveBeenCalledWith({
        description: "Exercise",
        type: "",
        lastUpdated: expect.any(Number),
        category: ["Chore", "🧹"],
      })
    })
  })

  describe("when the user chooses weekly type", () => {
    it("defaults to frequency of 1", async () => {
      const user = userEvent.setup()
      const onSubmit = jest.fn()
      render(<AddTaskForm {...commonProps} onSubmit={onSubmit} />)

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
        lastUpdated: expect.any(Number),
        category: ["Chore", "🧹"],
        frequency: 1,
      })
    })

    describe("and sets a valid frequency", () => {
      it("submits the task with the given frequency", async () => {
        const user = userEvent.setup()
        const onSubmit = jest.fn()
        render(<AddTaskForm {...commonProps} onSubmit={onSubmit} />)

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
          lastUpdated: expect.any(Number),
          category: ["Chore", "🧹"],
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
          lastUpdated: expect.any(Number),
          category: ["Chore", "🧹"],
          dueDate: expect.any(Number),
        })
      })
    })
  })

  describe("when the user enters a new category", () => {
    it("requires an emoji", async () => {
      const user = userEvent.setup()
      const onSubmit = jest.fn()
      render(<AddTaskForm {...commonProps} onSubmit={onSubmit} />)

      await user.type(
        screen.getByRole("textbox", { name: "Description" }),
        "Exercise"
      )
      await user.selectOptions(screen.getByRole("combobox", { name: "Type" }), [
        "毎日",
      ])
      await user.type(screen.getByRole("textbox", { name: "Label" }), "fitness")
      await user.click(screen.getByRole("button", { name: "Create task" }))

      expect(
        screen.getByText("Pick an emoji for the category")
      ).toBeInTheDocument()
      expect(onSubmit).not.toHaveBeenCalled()

      await user.type(screen.getByRole("textbox", { name: "Emoji" }), "🏃‍♀️")
      await user.click(screen.getByRole("button", { name: "Create task" }))

      expect(onSubmit).toHaveBeenCalledWith({
        description: "Exercise",
        type: "毎日",
        lastUpdated: expect.any(Number),
        category: ["fitness", "🏃‍♀️"],
      })
    })
  })

  it("allows the user to select a previously used category", async () => {
    const user = userEvent.setup()
    const onSubmit = jest.fn()
    render(<AddTaskForm {...commonProps} onSubmit={onSubmit} />)

    await user.type(
      screen.getByRole("textbox", { name: "Description" }),
      "Anki"
    )
    await user.selectOptions(screen.getByRole("combobox", { name: "Type" }), [
      "毎日",
    ])
    await user.selectOptions(
      screen.getByRole("combobox", { name: "Category" }),
      ["📖"]
    )
    await user.click(screen.getByRole("button", { name: "Create task" }))

    expect(onSubmit).toHaveBeenCalledWith({
      description: "Anki",
      type: "毎日",
      lastUpdated: expect.any(Number),
      category: ["Learning", "📖"],
    })
  })
})
