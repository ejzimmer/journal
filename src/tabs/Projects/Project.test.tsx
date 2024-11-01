import { render, screen } from "@testing-library/react"
import {
  MockTaskProvider,
  TASKS,
} from "../../shared/TaskList/testUtils/MockTaskProvider"
import { Project } from "./Project"
import userEvent from "@testing-library/user-event"

const PROJECT = {
  name: "Make shirt",
  category: "🪡",
  status: "not started",
  tasks: [],
}

xdescribe("Project", () => {
  it("shows the project name, category, status & list of tasks", async () => {
    const tasks = ["11", "12", "13"]
    render(<Project project={{ ...PROJECT, tasks }} onChange={jest.fn()} />, {
      wrapper: MockTaskProvider,
    })

    expect(
      screen.getByRole("heading", { name: "Make shirt" })
    ).toBeInTheDocument()
    const categorySelect = screen.getByRole("combobox", { name: "Category" })
    expect(categorySelect).toHaveValue("🪡")
    expect(screen.getByText("not started")).toBeInTheDocument()

    const labels = tasks.map(
      (task) => TASKS[task as keyof typeof TASKS].description
    )
    const checkboxes = await Promise.all(
      labels.map((label) => screen.findByRole("checkbox", { name: label }))
    )
    checkboxes.forEach((checkbox) => expect(checkbox).toBeInTheDocument())
  })

  describe("when the user updates the name", () => {
    it("calls onChange", async () => {
      const onChange = jest.fn()
      render(<Project project={PROJECT} onChange={onChange} />, {
        wrapper: MockTaskProvider,
      })

      await userEvent.click(screen.getByText(PROJECT.name))
      const nameInput = screen.getByRole("textbox", { name: "Project name" })
      await userEvent.clear(nameInput)
      await userEvent.type(nameInput, "Blue shirt{Enter}")

      expect(onChange).toHaveBeenCalledWith({ ...PROJECT, name: "Blue shirt" })
    })
  })

  describe("when the user updates the category", () => {
    it("calls onChange", async () => {
      const onChange = jest.fn()
      render(<Project project={PROJECT} onChange={onChange} />, {
        wrapper: MockTaskProvider,
      })

      const categorySelect = screen.getByRole("combobox", { name: "Category" })
      await userEvent.selectOptions(categorySelect, "🧶")

      expect(onChange).toHaveBeenCalledWith({ ...PROJECT, category: "🧶" })
    })
  })

  describe("when the user updates the status", () => {
    it("calls onChange", async () => {
      const onChange = jest.fn()
      render(<Project project={PROJECT} onChange={onChange} />, {
        wrapper: MockTaskProvider,
      })

      const statusSelect = screen.getByRole("combobox", { name: "Status" })
      await userEvent.selectOptions(statusSelect, "in progress")

      expect(onChange).toHaveBeenCalledWith({
        ...PROJECT,
        status: "in progress",
      })
    })
  })

  describe("when there are no tasks", () => {
    it("shows the add task form", () => {
      render(<Project project={PROJECT} onChange={jest.fn()} />, {
        wrapper: MockTaskProvider,
      })

      expect(
        screen.getByRole("textbox", { name: "Task description" })
      ).toBeInTheDocument()
    })
  })

  describe("when there are tasks", () => {
    it("shows the Add task button, which shows the add task from when clicked", async () => {
      const tasks = ["11", "12", "13"]
      render(<Project project={{ ...PROJECT, tasks }} onChange={jest.fn()} />, {
        wrapper: MockTaskProvider,
      })

      expect(
        screen.queryByRole("textbox", { name: "Task description" })
      ).not.toBeInTheDocument()
      const addTaskButton = screen.getByRole("button", { name: "Add task" })
      expect(addTaskButton).toBeInTheDocument()

      await userEvent.click(addTaskButton)
      expect(
        screen.getByRole("textbox", { name: "Task description" })
      ).toBeInTheDocument()
      expect(addTaskButton).not.toBeInTheDocument()
    })
  })

  describe("when the user clicks the cancel button on the add task form", () => {
    it("hides the form", async () => {
      render(<Project project={PROJECT} onChange={jest.fn()} />, {
        wrapper: MockTaskProvider,
      })

      const addTaskForm = screen.getByRole("textbox", {
        name: "Task description",
      })
      await userEvent.click(screen.getByRole("button", { name: "Cancel" }))

      expect(addTaskForm).not.toBeInTheDocument()
      expect(
        screen.getByRole("button", { name: "Add task" })
      ).toBeInTheDocument()
    })
  })

  // when any task becomes done, update status
  // when all task become done, update status
  // when status === done & new task is added, update status
  // when status === done & task is unchecked, update status
})
