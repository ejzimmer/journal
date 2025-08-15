import { render, screen } from "@testing-library/react"
import { Task } from "./Task"
import { Item, STATUS_KEYS } from "../../shared/TaskList/types"
import userEvent from "@testing-library/user-event"

const task: Item = {
  id: "123",
  description: "Brush teeth",
  lastUpdated: 0,
  labels: [{ text: "chore", colour: "blue" }],
  status: STATUS_KEYS[0],
}

const commonProps = {
  task,
  onChange: jest.fn(),
  onDelete: jest.fn(),
  onMoveTo: jest.fn(),
}

describe("Task", () => {
  describe("when the task hasn't been started", () => {
    describe("and the user clicks the button", () => {
      it("updates to in progress", async () => {
        const user = userEvent.setup()
        const onChange = jest.fn()
        render(<Task {...commonProps} onChange={onChange} />)

        expect(screen.getByText("Brush teeth")).toBeInTheDocument()
        expect(screen.getByText("🧹")).toBeInTheDocument()

        await user.click(
          screen.getByRole("button", {
            name: "start Brush teeth",
          })
        )

        expect(onChange).toHaveBeenCalledWith({
          ...task,
          status: "in_progress",
        })
      })
    })
  })

  describe("when the task is in progress", () => {
    describe("and the user clicks the button", () => {
      it("updates to done", async () => {
        const user = userEvent.setup()
        const onChange = jest.fn()
        render(
          <Task
            {...commonProps}
            task={{ ...task, status: "in_progress" }}
            onChange={onChange}
          />
        )

        expect(screen.getByText(/- in progress/)).toBeInTheDocument()

        await user.click(
          screen.getByRole("button", {
            name: "finish Brush teeth",
          })
        )

        expect(onChange).toHaveBeenCalledWith({
          ...task,
          status: "done",
        })
      })
    })
  })

  describe("when the task is done", () => {
    describe("and the user clicks the button", () => {
      it("updates to not done", async () => {
        const user = userEvent.setup()
        const onChange = jest.fn()
        render(
          <Task
            {...commonProps}
            task={{ ...task, status: "done" }}
            onChange={onChange}
          />
        )

        expect(screen.getByText(/- done/)).toBeInTheDocument()

        await user.click(
          screen.getByRole("button", {
            name: "reset Brush teeth",
          })
        )

        expect(onChange).toHaveBeenCalledWith({
          ...task,
          status: "not_started",
        })
      })
    })
  })

  it("can update its description", async () => {
    const user = userEvent.setup()
    const onChange = jest.fn()
    render(<Task {...commonProps} onChange={onChange} />)

    await user.click(screen.getByText("Brush teeth"))
    const input = screen.getByRole("textbox")
    await userEvent.clear(input)
    await userEvent.type(input, "Floss teeth")
    await userEvent.keyboard("{Enter}")

    expect(onChange).toHaveBeenCalledWith({
      ...task,
      description: "Floss teeth",
    })
  })

  it("can be deleted", async () => {
    const user = userEvent.setup()
    const onDelete = jest.fn()
    render(<Task {...commonProps} onDelete={onDelete} />)

    await user.click(
      screen.getByRole("button", { name: "delete 🧹 Brush teeth" })
    )
    await user.click(screen.getByRole("button", { name: "Yes, delete" }))

    expect(onDelete).toHaveBeenCalled()
  })

  describe("moving by keyboard", () => {
    it("can move up one position", async () => {
      const user = userEvent.setup()
      const onMoveTo = jest.fn()
      render(<Task {...commonProps} onMoveTo={onMoveTo} />)

      const moveMenu = screen.getByRole("button", { name: "move Brush teeth" })
      moveMenu.focus()
      await user.keyboard("{ArrowUp}")

      expect(onMoveTo).toHaveBeenCalledWith("previous")
    })

    it("can move down one position", async () => {
      const user = userEvent.setup()
      const onMoveTo = jest.fn()
      render(<Task {...commonProps} onMoveTo={onMoveTo} />)

      const moveMenu = screen.getByRole("button", { name: "move Brush teeth" })
      moveMenu.focus()
      await user.keyboard("{ArrowDown}")

      expect(onMoveTo).toHaveBeenCalledWith("next")
    })

    it("can move to the start", async () => {
      const user = userEvent.setup()
      const onMoveTo = jest.fn()
      render(<Task {...commonProps} onMoveTo={onMoveTo} />)

      const moveMenu = screen.getByRole("button", { name: "move Brush teeth" })
      moveMenu.focus()
      await user.keyboard("{Shift>}{ArrowUp}")

      expect(onMoveTo).toHaveBeenCalledWith("start")
    })

    it("can move to the end", async () => {
      const user = userEvent.setup()
      const onMoveTo = jest.fn()
      render(<Task {...commonProps} onMoveTo={onMoveTo} />)

      const moveMenu = screen.getByRole("button", { name: "move Brush teeth" })
      moveMenu.focus()
      await user.keyboard("{Shift>}{ArrowDown}")

      expect(onMoveTo).toHaveBeenCalledWith("end")
    })
  })

  describe("moving by mouse", () => {
    it("can be moved up the list", async () => {
      const user = userEvent.setup()
      const onMoveTo = jest.fn()
      render(<Task {...commonProps} onMoveTo={onMoveTo} />)

      await user.click(screen.getByRole("button", { name: "move Brush teeth" }))
      await user.click(screen.getByRole("menuitem", { name: "Move up" }))

      expect(onMoveTo).toHaveBeenCalledWith("previous")
    })

    it("can be moved down the list", async () => {
      const user = userEvent.setup()
      const onMoveTo = jest.fn()
      render(<Task {...commonProps} onMoveTo={onMoveTo} />)

      await user.click(screen.getByRole("button", { name: "move Brush teeth" }))
      await user.click(screen.getByRole("menuitem", { name: "Move down" }))

      expect(onMoveTo).toHaveBeenCalledWith("next")
    })

    it("can be moved to the start of the list", async () => {
      const user = userEvent.setup()
      const onMoveTo = jest.fn()
      render(<Task {...commonProps} onMoveTo={onMoveTo} />)

      await user.click(screen.getByRole("button", { name: "move Brush teeth" }))
      await user.click(screen.getByRole("menuitem", { name: "Move to top" }))

      expect(onMoveTo).toHaveBeenCalledWith("start")
    })

    it("can be moved to the end of the list", async () => {
      const user = userEvent.setup()
      const onMoveTo = jest.fn()
      render(<Task {...commonProps} onMoveTo={onMoveTo} />)

      await user.click(screen.getByRole("button", { name: "move Brush teeth" }))
      await user.click(screen.getByRole("menuitem", { name: "Move to bottom" }))

      expect(onMoveTo).toHaveBeenCalledWith("end")
    })
  })
})
