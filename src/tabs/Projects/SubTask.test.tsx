import { render, screen } from "@testing-library/react"
import { SubTask } from "./SubTask"
import userEvent from "@testing-library/user-event"

describe("SubTask", () => {
  describe("when the user clicks the sub-task", () => {
    it("toggles the status between done & not done", async () => {
      const onDoneChange = jest.fn()
      render(
        <SubTask
          title="Cut out the pattern"
          isDone={false}
          onDoneChange={onDoneChange}
          onDelete={jest.fn()}
          onTitleChange={jest.fn()}
        />
      )

      const task = screen.getByRole("checkbox", { name: /Cut out the pattern/ })
      await userEvent.click(task)

      expect(onDoneChange).toHaveBeenCalledWith(true)
    })
  })

  describe("when the user clicks the delete button", () => {
    it("calls the onDelete handler", async () => {
      const onDelete = jest.fn()
      const onDoneChange = jest.fn()
      render(
        <SubTask
          title="Buy more fabric"
          isDone={false}
          onDoneChange={onDoneChange}
          onDelete={onDelete}
          onTitleChange={jest.fn()}
        />
      )

      const deleteButton = screen.getByRole("button", {
        name: "Delete task: Buy more fabric",
      })
      await userEvent.click(deleteButton)

      expect(onDelete).toHaveBeenCalled()
      expect(onDoneChange).not.toHaveBeenCalled()
    })
  })

  describe("when the user clicks the edit button", () => {
    it("switches to edit mode", async () => {
      render(
        <SubTask
          title="CUt put apttern"
          isDone={false}
          onDoneChange={jest.fn()}
          onDelete={jest.fn()}
          onTitleChange={jest.fn()}
        />
      )

      const editButton = screen.getByRole("button", {
        name: "Edit task: CUt put apttern",
      })
      await userEvent.click(editButton)

      const input = screen.getByRole("textbox")
      expect(input).toBeInTheDocument()
      expect(input).toHaveValue("CUt put apttern")
      expect(
        screen.getByRole("button", { name: "Save task" })
      ).toBeInTheDocument()
    })
  })

  describe("when the subtask is in Edit mode", () => {
    describe("when the user clicks outside the input", () => {
      it("hides the input & does not submit the updated title", async () => {
        const onTitleChange = jest.fn()
        const { container } = await renderComponentInEditMode({ onTitleChange })

        await userEvent.click(container)

        expect(screen.queryByRole("textbox")).not.toBeInTheDocument()
        expect(onTitleChange).not.toHaveBeenCalled()
      })
    })

    describe("when the user clicks the save button", () => {
      it("hides the input and submits the updated title", async () => {
        const onTitleChange = jest.fn()
        await renderComponentInEditMode({
          onTitleChange,
          newTitle: "Cut out pattern",
        })

        const saveButton = screen.getByRole("button", { name: "Save task" })
        await userEvent.click(saveButton)

        expect(screen.queryByRole("textbox")).not.toBeInTheDocument()
        expect(onTitleChange).toHaveBeenCalledWith("Cut out pattern")
      })
    })
    describe("when the user presses enter", () => {
      it("hides the input and submits the updated title", async () => {
        const onTitleChange = jest.fn()
        await renderComponentInEditMode({
          onTitleChange,
          newTitle: "Cut out pattern",
        })

        await userEvent.keyboard("{Enter}")

        expect(screen.queryByRole("textbox")).not.toBeInTheDocument()
        expect(onTitleChange).toHaveBeenCalledWith("Cut out pattern")
      })
    })
  })
})

async function renderComponentInEditMode({
  onTitleChange = jest.fn(),
  newTitle = "Cut out pattern",
}) {
  const oldTitle = "CUt put apttern"
  const view = render(
    <SubTask
      title={oldTitle}
      isDone={false}
      onDoneChange={jest.fn()}
      onDelete={jest.fn()}
      onTitleChange={onTitleChange}
    />
  )

  const editButton = screen.getByRole("button", {
    name: `Edit task: ${oldTitle}`,
  })
  await userEvent.click(editButton)

  const titleInput = screen.getByRole("textbox")
  await userEvent.clear(titleInput)
  await userEvent.type(titleInput, newTitle)

  return view
}
