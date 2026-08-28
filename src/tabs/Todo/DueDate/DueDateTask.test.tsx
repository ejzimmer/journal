import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { DueDateTask } from "./DueDateTask"
import { FirebaseContext } from "../../../shared/FirebaseContext"
import { CategoriesContext } from ".."
import { CalendarTask } from "../../../shared/types"

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

const storageContext = {
  addItem: jest.fn(),
  updateItem: jest.fn(),
  deleteItem: jest.fn(),
  updateList: jest.fn(),
  setValue: jest.fn(),
  useValue: () => ({ value: undefined, loading: false }),
}

const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <FirebaseContext.Provider value={storageContext}>
    <CategoriesContext.Provider value={["🛒", "📓"]}>
      {children}
    </CategoriesContext.Provider>
  </FirebaseContext.Provider>
)

describe("DueDateTask", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe("when the user edits the description and presses Enter", () => {
    it("saves the new description, not the original one", async () => {
      const user = userEvent.setup()
      render(<DueDateTask task={task} />, { wrapper: Wrapper })

      await user.click(screen.getByText("Pay rent"))
      const input = screen.getByRole("textbox", { name: "Description" })
      await user.clear(input)
      await user.type(input, "Pay rent and bills{Enter}")

      expect(storageContext.updateItem).toHaveBeenCalledWith(
        "today/暦",
        expect.objectContaining({ description: "Pay rent and bills" }),
      )
    })
  })

  describe("when the user clears the description", () => {
    it("deletes the task instead of saving an empty description", async () => {
      const user = userEvent.setup()
      render(<DueDateTask task={task} />, { wrapper: Wrapper })

      await user.click(screen.getByText("Pay rent"))
      const input = screen.getByRole("textbox", { name: "Description" })
      await user.clear(input)
      await user.keyboard("{Enter}")

      expect(storageContext.deleteItem).toHaveBeenCalledWith("today/暦", task)
      expect(storageContext.updateItem).not.toHaveBeenCalled()
    })
  })
})
