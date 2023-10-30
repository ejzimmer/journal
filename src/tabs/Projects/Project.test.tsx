import { render, screen } from "@testing-library/react"
import { Project } from "./Project"
import { List } from "@chakra-ui/react"

const PROJECT = {
  name: "Sew hoodie",
  tasks: [
    { description: "Buy fabric", isDone: true },
    { description: "Prewash fabric", isDone: false },
  ],
}

describe("Project", () => {
  it("has a title", () => {
    render(<Project project={PROJECT} onChange={jest.fn()} />, {
      wrapper: List,
    })

    const name = screen.getByRole("textbox", { name: "Project name" })
    expect(name).toHaveValue(PROJECT.name)
  })

  it("displays the list of tasks", () => {
    render(<Project project={PROJECT} onChange={jest.fn()} />, {
      wrapper: List,
    })

    expect(screen.getByRole("checkbox", { name: /Buy fabric/ })).toBeChecked()
    expect(prewashFabric()).not.toBeChecked()
  })

  describe("when all the tasks in a project are done", () => {
    const allDoneProject = {
      ...PROJECT,
      tasks: PROJECT.tasks.map((task) => ({ ...task, isDone: true })),
    }

    it("marks the project as done", async () => {
      render(<Project project={allDoneProject} onChange={jest.fn()} />, {
        wrapper: List,
      })

      expect(screen.getByText("✅")).toBeInTheDocument()
    })
  })
})

const prewashFabric = () =>
  screen.getByRole("checkbox", { name: /Prewash fabric/ })
