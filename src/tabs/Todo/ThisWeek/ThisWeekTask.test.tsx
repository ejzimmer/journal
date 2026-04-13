import { render, screen } from "@testing-library/react"
import { ThisWeekTask } from "./ThisWeekTask"
import { WeeklyTask } from "../../../shared/types"
import userEvent from "@testing-library/user-event"
import { FirebaseContext } from "../../../shared/FirebaseContext"
import { CategoriesContext } from ".."
import { subDays } from "date-fns"

const task: WeeklyTask = {
  frequency: 3,
  id: "1",
  parentId: "weekly",
  position: 4,
  description: "Strength training",
  category: "💪",
  completed: [
    subDays(new Date(), 4).getTime(),
    subDays(new Date(), 2).getTime(),
  ],
}

const storageContext = {
  addItem: jest.fn(),
  updateItem: jest.fn(),
  deleteItem: jest.fn(),
  updateList: jest.fn(),
  useValue: () => {
    return { value: {} as any, loading: false }
  },
}

const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <FirebaseContext.Provider value={storageContext}>
    <CategoriesContext.Provider value={["🧘", "💪"]}>
      {children}
    </CategoriesContext.Provider>
  </FirebaseContext.Provider>
)

const expectToBeInViewMode = () => {
  expect(screen.queryByRole("combobox")).not.toBeInTheDocument()
  expect(
    screen.getByRole("button", { name: task.category }),
  ).toBeInTheDocument()
  expect(screen.queryByRole("textbox")).not.toBeInTheDocument()
  expect(screen.queryByRole("spinbutton")).not.toBeInTheDocument()
  expect(screen.getByRole("progressbar")).toBeInTheDocument()
}

describe("ThisWeekTask", () => {
  describe("in view mode", () => {
    describe("when the user clicks the button", () => {
      it("updates the list of times completed", async () => {
        const user = userEvent.setup()
        render(<ThisWeekTask task={task} />, {
          wrapper: Wrapper,
        })

        await user.click(screen.getByRole("button", { name: task.category }))

        expect(storageContext.updateItem).toHaveBeenCalledWith(
          expect.anything(),
          expect.objectContaining({
            completed: [...task.completed!, expect.any(Number)],
          }),
        )
      })
    })

    describe("when the user shift+clicks the button", () => {
      it("removes the most recently completed item", async () => {
        const user = userEvent.setup()
        render(<ThisWeekTask task={task} />, {
          wrapper: Wrapper,
        })

        await user.keyboard("{Shift>}")
        await user.click(screen.getByRole("button", { name: task.category }))

        expect(storageContext.updateItem).toHaveBeenCalledWith(
          expect.anything(),
          expect.objectContaining({
            completed: [task.completed?.[0]],
          }),
        )
      })
    })

    describe("when the user clicks the description", () => {
      it("goes into edit mode", async () => {
        const user = userEvent.setup()
        render(<ThisWeekTask task={task} />, { wrapper: Wrapper })

        await user.click(screen.getByText(task.description))

        expect(
          screen.queryByRole("button", { name: task.category }),
        ).not.toBeInTheDocument()
        expect(
          screen.getByRole("option", { name: task.category }),
        ).toHaveAttribute("aria-selected", "true")

        expect(screen.queryByText(task.description)).not.toBeInTheDocument()
        const descriptionInput = screen.getByRole("textbox", {
          name: "Description",
        })
        expect(descriptionInput).toHaveValue(task.description)

        expect(screen.queryByRole("progressbar")).not.toBeInTheDocument()
        const frequencyInput = screen.getByRole("spinbutton", {
          name: "Frequency",
        })
        expect(frequencyInput).toHaveValue(task.frequency)
      })
    })

    it("shows the current progress", () => {
      render(<ThisWeekTask task={task} />, { wrapper: Wrapper })

      const progress = screen.getByRole("progressbar")
      expect(progress).toHaveValue(2)
      const completedList = screen.getAllByRole("listitem")
      completedList.forEach((item) =>
        expect(item.textContent).toMatch(
          /^[A-Z][a-z][a-z] \d\d?(st|nd|rd|th)$/,
        ),
      )
    })

    describe("when the item has been completed more times than necessary", () => {
      it("also shows the overflow", () => {
        const tooMuchComplete = [
          subDays(new Date(), 7).getTime(),
          subDays(new Date(), 6).getTime(),
          subDays(new Date(), 5).getTime(),
          ...task.completed!,
          subDays(new Date(), 1).getTime(),
        ]
        render(
          <ThisWeekTask task={{ ...task, completed: tooMuchComplete }} />,
          { wrapper: Wrapper },
        )

        expect(screen.getByText("+3")).toBeInTheDocument()
      })
    })
  })

  describe("in edit mode", () => {
    describe("when the user picks a new category", () => {
      it("updates the category and switches to view mode", async () => {
        const user = userEvent.setup()
        const onChange = jest.spyOn(storageContext, "updateItem")
        render(<ThisWeekTask task={task} />, { wrapper: Wrapper })

        await user.click(screen.getByText(task.description))

        await user.click(screen.getByRole("combobox"))
        await user.click(screen.getByRole("option", { name: "🧘" }))

        expect(onChange).toHaveBeenCalledWith(
          expect.anything(),
          expect.objectContaining({ category: "🧘" }),
        )
        expectToBeInViewMode()
      })
    })

    describe("when the user updates the description/frequency and presses enter", () => {
      it("updates the description/frequency and switches to view mode", async () => {
        const user = userEvent.setup()
        const onChange = jest.spyOn(storageContext, "updateItem")
        render(<ThisWeekTask task={task} />, { wrapper: Wrapper })

        await user.click(screen.getByText(task.description))

        const descriptionInput = screen.getByRole("textbox", {
          name: "Description",
        })
        await user.clear(descriptionInput)
        await user.type(descriptionInput, "Strength & mobility")
        const frequencyInput = screen.getByRole("spinbutton", {
          name: "Frequency",
        })
        await user.clear(frequencyInput)
        await user.type(frequencyInput, "4")
        await user.keyboard("{Enter}")

        expect(onChange).toHaveBeenCalledWith(
          expect.anything(),
          expect.objectContaining({
            description: "Strength & mobility",
            frequency: 4,
          }),
        )
        expectToBeInViewMode()
      })
    })

    describe("when the user deletes the description and presses enter", () => {
      it("deletes the item", async () => {
        const user = userEvent.setup()
        const onDelete = jest.spyOn(storageContext, "deleteItem")
        render(<ThisWeekTask task={task} />, { wrapper: Wrapper })

        await user.click(screen.getByText(task.description))

        const descriptionInput = screen.getByRole("textbox", {
          name: "Description",
        })
        await user.clear(descriptionInput)
        await user.keyboard("{Enter}")

        expect(onDelete).toHaveBeenCalled()
      })
    })

    describe("when the user deletes the frequency", () => {
      it("switches back to view mode without changing anything", async () => {
        const user = userEvent.setup()
        const onChange = jest.spyOn(storageContext, "updateItem")
        const onDelete = jest.spyOn(storageContext, "deleteItem")
        render(<ThisWeekTask task={task} />, { wrapper: Wrapper })

        await user.click(screen.getByText(task.description))

        await user.clear(
          screen.getByRole("spinbutton", {
            name: "Frequency",
          }),
        )
        await user.keyboard("{Enter}")

        expect(onChange).not.toHaveBeenCalled()
        expect(onDelete).not.toHaveBeenCalled()
        expectToBeInViewMode()
        expect(screen.getByRole("progressbar")).toHaveAttribute(
          "max",
          `${task.frequency}`,
        )
      })
    })

    describe("whe the user presses Escape", () => {
      it("returns to view mode without saving any changes", async () => {
        const user = userEvent.setup()
        const onChange = jest.spyOn(storageContext, "updateItem")
        render(<ThisWeekTask task={task} />, { wrapper: Wrapper })

        await user.click(screen.getByText(task.description))

        const descriptionInput = screen.getByRole("textbox", {
          name: "Description",
        })
        await user.clear(descriptionInput)
        await user.type(descriptionInput, "Strength & mobility")
        const frequencyInput = screen.getByRole("spinbutton", {
          name: "Frequency",
        })
        await user.clear(frequencyInput)
        await user.type(frequencyInput, "4")
        await user.keyboard("{Escape}")

        expect(onChange).not.toHaveBeenCalled()
        expectToBeInViewMode()
      })
    })
  })
})
