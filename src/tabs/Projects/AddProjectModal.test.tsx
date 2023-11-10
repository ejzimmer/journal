import { render, screen } from "@testing-library/react"
import { AddProjectModal } from "./AddProjectModal"
import userEvent from "@testing-library/user-event"

describe("AddProjectModal", () => {
  describe("when the user clicks Cancel", () => {
    it("closes without saving", async () => {
      const onSave = jest.fn()
      const onClose = jest.fn()
      render(
        <AddProjectModal isOpen={true} onSave={onSave} onClose={onClose} />
      )

      await userEvent.click(screen.getByRole("button", { name: "Cancel" }))

      expect(onSave).not.toHaveBeenCalled()
      expect(onClose).toHaveBeenCalled()
    })
  })

  describe("when the user clicks Save", () => {
    describe("and the mandatory fields haven't been filled in", () => {
      it("shows an error and does not save", async () => {
        const onSave = jest.fn()
        const onClose = jest.fn()
        render(
          <AddProjectModal isOpen={true} onSave={onSave} onClose={onClose} />
        )

        await userEvent.click(screen.getByRole("button", { name: "Save" }))

        expect(onSave).not.toHaveBeenCalled()
        expect(onClose).not.toHaveBeenCalled()
        expect(
          screen.getByText("Project name is mandatory")
        ).toBeInTheDocument()
        expect(
          screen.getByText("Project type is mandatory")
        ).toBeInTheDocument()
      })
    })

    describe("and the mandatory fields have been filled in", () => {
      it("saves and closes", async () => {
        const onSave = jest.fn()
        const onClose = jest.fn()
        render(
          <AddProjectModal isOpen={true} onSave={onSave} onClose={onClose} />
        )

        await userEvent.type(
          screen.getByRole("textbox", { name: "Project name" }),
          "Journal app"
        )
        await userEvent.selectOptions(
          screen.getByRole("combobox", { name: "Project type" }),
          "👩‍💻"
        )
        await userEvent.click(screen.getByRole("button", { name: "Save" }))

        expect(onSave).toHaveBeenCalledWith({
          name: "Journal app",
          category: "👩‍💻",
          tasks: [],
        })
        expect(onClose).toHaveBeenCalled()
      })
    })
  })
})
