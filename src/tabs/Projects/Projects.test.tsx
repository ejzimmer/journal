import { render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { Projects } from "."

describe("Projects", () => {
  it("displays the list of projects", () => {
    render(<Projects />)

    const names = screen.getAllByRole<HTMLInputElement>("textbox", {
      name: "Project name",
    })
    expect(names.map((name) => name.value)).toEqual([
      "Sew shirt",
      "Sew jeans",
      "Organise sewing room",
    ])
  })

  it("adds new tasks", async () => {
    render(<Projects />)

    await addTaskToProject("Buy pattern", "Sew shirt")

    expect(
      screen.queryByRole("textbox", {
        name: "New task description",
      })
    ).not.toBeInTheDocument()
    expect(
      screen.getByRole("checkbox", { name: "Buy pattern" })
    ).toBeInTheDocument()
  })

  it("marks a task as done", async () => {
    render(<Projects />)

    await userEvent.click(prewashFabric())

    expect(prewashFabric()).toBeChecked()
  })

  it("updates the task description", async () => {
    const { container } = render(<Projects />)

    const prewashFabricLabel = screen
      .getAllByRole<HTMLInputElement>("textbox")
      .find((textbox) => textbox.value === "Prewash fabric")!
    await userEvent.clear(prewashFabricLabel)
    await userEvent.type(prewashFabricLabel, "Pre-wash fabric")
    await userEvent.click(container)

    expect(prewashFabricLabel).toHaveValue("Pre-wash fabric")
  })

  it("deletes a task", async () => {
    render(<Projects />)

    const deletePrewashFabric = screen.getByRole("button", {
      name: "Delete task: Prewash fabric",
    })
    await userEvent.click(deletePrewashFabric)
    await userEvent.click(screen.getByRole("button", { name: "Yes" }))

    expect(deletePrewashFabric).not.toBeInTheDocument()
  })
})

const prewashFabric = () =>
  screen.getByRole("checkbox", { name: /Prewash fabric/ })

const addTaskToProject = async (task: string, projectName: string) => {
  const project = screen.getByRole("listitem", {
    name: new RegExp(projectName),
  })

  const newTaskButton = within(project).getByRole("button", {
    name: "New task",
  })
  await userEvent.click(newTaskButton)

  const descriptionInput = screen.getByRole("textbox", {
    name: "New task description",
  })
  await userEvent.type(descriptionInput, task)
  await userEvent.keyboard("{Enter}")
}
