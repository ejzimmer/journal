import { render, screen } from "@testing-library/react"
import { Project } from "./Project"
import userEvent from "@testing-library/user-event"

const PROJECT = {
  name: "Sew hoodie",
}

describe("Project", () => {
  it("has a title", () => {
    render(<Project project={PROJECT} />)

    expect(screen.getByText(PROJECT.name)).toBeInTheDocument()
  })

  describe("when the user clicks the Add Task button", () => {
    it("renders the add task form", async () => {
      render(<Project project={PROJECT} />)

      const newTaskButton = screen.getByRole("button", { name: "New task" })
      await userEvent.click(newTaskButton)

      expect(screen.getByRole("textbox")).toBeInTheDocument()
      expect(newTaskButton).not.toBeInTheDocument()
    })
  })
})
