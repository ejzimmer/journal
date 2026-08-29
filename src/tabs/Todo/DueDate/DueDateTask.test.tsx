import { screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { DueDateTask } from "./DueDateTask"
import { CategoriesContext } from ".."
import { CalendarTask } from "../../../shared/types"
import { renderWithStorage } from "../../../shared/storageContextTestUtils"

const task: CalendarTask = {
  id: "1",
  parentId: "calendar",
  position: 0,
  description: "Pay rent",
  category: "🛒",
  dueDate: new Date("2026-08-10").getTime(),
  status: "ready",
  statusUpdateDate: Date.now(),
}

describe("DueDateTask", () => {
  describe("when the user edits the description and presses Enter", () => {
    it("saves the new description, not the original one", async () => {
      const user = userEvent.setup()
      const updateItem = jest.fn()
      renderWithStorage(
        <CategoriesContext.Provider value={["🛒", "📓"]}>
          <DueDateTask task={task} />
        </CategoriesContext.Provider>,
        { value: { updateItem } },
      )

      await user.click(screen.getByText("Pay rent"))
      const input = screen.getByRole("textbox", { name: "Description" })
      await user.clear(input)
      await user.type(input, "Pay rent and bills{Enter}")

      expect(updateItem).toHaveBeenCalledWith(
        "today/暦",
        expect.objectContaining({ description: "Pay rent and bills" }),
      )
    })
  })

  describe("when the user clears the description", () => {
    it("deletes the task instead of saving an empty description", async () => {
      const user = userEvent.setup()
      const updateItem = jest.fn()
      const deleteItem = jest.fn()
      renderWithStorage(
        <CategoriesContext.Provider value={["🛒", "📓"]}>
          <DueDateTask task={task} />
        </CategoriesContext.Provider>,
        { value: { updateItem, deleteItem } },
      )

      await user.click(screen.getByText("Pay rent"))
      const input = screen.getByRole("textbox", { name: "Description" })
      await user.clear(input)
      await user.keyboard("{Enter}")

      expect(deleteItem).toHaveBeenCalledWith("today/暦", task)
      expect(updateItem).not.toHaveBeenCalled()
    })
  })
})
