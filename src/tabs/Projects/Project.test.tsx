import { render, screen } from "@testing-library/react"
import { Project } from "./Project"
import userEvent from "@testing-library/user-event"

const PROJECT = {
  name: "Sew hoodie",
  tasks: [
    { description: "Buy fabric", isDone: true },
    { description: "Prewash fabric", isDone: false },
  ],
}

describe("Project", () => {
  it("has a title", () => {
    render(<Project project={PROJECT} />)

    const name = screen.getByRole("textbox", { name: "Project name" })
    expect(name).toHaveValue(PROJECT.name)
  })

  it("displays the list of tasks", () => {
    render(<Project project={PROJECT} />)

    expect(screen.getByRole("checkbox", { name: /Buy fabric/ })).toBeChecked()
    expect(prewashFabric()).not.toBeChecked()
  })

  it("adds new tasks", async () => {
    render(<Project project={PROJECT} />)

    await addTask("Buy pattern")

    expect(
      screen.queryByRole("textbox", {
        name: "New task description",
      })
    ).not.toBeInTheDocument()
    expect(screen.getByText("Buy pattern")).toBeInTheDocument()
  })

  it("marks a task as done", async () => {
    render(<Project project={PROJECT} />)

    await userEvent.click(prewashFabric())

    expect(prewashFabric()).toBeChecked()
  })

  it("updates the task description", async () => {
    const { container } = render(<Project project={PROJECT} />)

    const prewashFabric = screen
      .getAllByRole<HTMLInputElement>("textbox")
      .find((textbox) => textbox.value === "Prewash fabric")!
    await userEvent.clear(prewashFabric)
    await userEvent.type(prewashFabric, "Pre-wash fabric")
    await userEvent.click(container)

    expect(prewashFabric).toHaveValue("Pre-wash fabric")
    expect(
      screen.getByRole("checkbox", { name: /Pre-wash fabric/ })
    ).toBeInTheDocument()
  })

  it("deletes a task", async () => {
    render(<Project project={PROJECT} />)

    const deletePrewashFabric = screen.getByRole("button", {
      name: "Delete task: Prewash fabric",
    })
    await userEvent.click(deletePrewashFabric)
    await userEvent.click(screen.getByRole("button", { name: "Yes" }))

    expect(screen.queryByText("Prewash fabric")).not.toBeInTheDocument()
  })

  describe("when all the tasks in a project are done", () => {
    const allDoneProject = {
      ...PROJECT,
      tasks: PROJECT.tasks.map((task) => ({ ...task, isDone: true })),
    }

    it("marks the project as done", async () => {
      render(<Project project={PROJECT} />)

      await userEvent.click(prewashFabric())

      expect(screen.getByText("✅")).toBeInTheDocument()
    })

    describe("when one of the tasks is then unchecked", () => {
      it("unmarks the project as done", async () => {
        render(<Project project={allDoneProject} />)

        const doneIndicator = screen.getByText("✅")
        await userEvent.click(prewashFabric())

        expect(doneIndicator).not.toBeInTheDocument()
      })
    })

    describe("when a new task is added", () => {
      it("unmarks the project as done", async () => {
        render(<Project project={allDoneProject} />)

        const doneIndicator = screen.getByText("✅")
        await addTask("Buy pattern")

        expect(doneIndicator).not.toBeInTheDocument()
      })
    })
  })
})

const prewashFabric = () =>
  screen.getByRole("checkbox", { name: /Prewash fabric/ })

const addTask = async (description: string) => {
  const newTaskButton = screen.getByRole("button", { name: "New task" })
  await userEvent.click(newTaskButton)

  const descriptionInput = screen.getByRole("textbox", {
    name: "New task description",
  })
  await userEvent.type(descriptionInput, description)
  await userEvent.keyboard("{Enter}")
}
