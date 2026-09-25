import { render, screen, within } from "@testing-library/react"
import { Exercise, ExerciseTracker } from "./ExerciseTracker"
import userEvent from "@testing-library/user-event"
import { FirebaseContext, ContextType } from "../../shared/FirebaseContext"
import { ReactNode } from "react"

function Wrapper({
  value,
  children,
}: {
  value?: Partial<ContextType>
  children: ReactNode
}) {
  return (
    <FirebaseContext.Provider
      value={{
        addItem: jest.fn(),
        updateItem: jest.fn(),
        deleteItem: jest.fn(),
        updateList: jest.fn(),
        useValue: jest.fn(),
        ...value,
      }}
    >
      {children}
    </FirebaseContext.Provider>
  )
}

const exercises: Exercise[] = [
  {
    id: "1",
    name: "Box pistol squat",
    updates: [
      {
        date: new Date("2026-08-12"),
        update:
          "2 x 5 x 3 mats + 1 low yoga block + 1 high yoga block, 1 x 5 3 mats + 2 low yoga blocks (eccentric only)",
      },
    ],
  },
  {
    id: "2",
    name: "Bulgarian split squat",
    updates: [
      {
        date: new Date("2026-08-12"),
        update: "3 x 10 x 8kg",
        recommendation: "increase",
      },
    ],
  },
  {
    id: "3",
    name: "B-stance RDL",
    updates: [
      { date: new Date("2026-08-12"), update: "3 x 10 x 16kg" },
      { date: new Date("2026-08-16"), update: "3 x 10 x 20kg" },
      { date: new Date("2026-08-20"), update: "3 x 10 x 20kg" },
    ],
  },
]

describe("ExerciseTracker", () => {
  it("shows previously tracked exercises + 1 empty column", () => {
    render(<ExerciseTracker exercises={exercises} />, { wrapper: Wrapper })

    const pistolSquatRow = screen.getByRole("row", { name: /Box pistol squat/ })
    const pistolSquatUpdate = within(pistolSquatRow).getByRole("cell", {
      name: /12 Aug 26/,
    })
    expect(pistolSquatUpdate).toHaveTextContent(/3 mats \+ 2 low yoga blocks/)

    const splitSquatRow = screen.getByRole("row", {
      name: /Bulgarian split squat/,
    })
    const splitSquatUpdate = within(splitSquatRow).getByRole("cell", {
      name: /12 Aug 26/,
    })
    expect(splitSquatUpdate).toHaveTextContent(/3 x 10 x 8kg/)
    expect(
      within(splitSquatUpdate).getByRole("img", { name: "increase" }),
    ).toBeInTheDocument()

    const pistolSquatCells = within(pistolSquatRow).getAllByRole("cell")
    const splitSquatCells = within(splitSquatRow).getAllByRole("cell")
    expect(pistolSquatCells).toHaveLength(4)
    expect(splitSquatCells).toHaveLength(4)
  })

  it("records an exercise, with today as the date by default", async () => {
    const user = userEvent.setup()
    const addItem = jest.fn()
    render(<ExerciseTracker exercises={exercises} />, {
      wrapper: ({ children }) => (
        <Wrapper children={children} value={{ addItem }} />
      ),
    })

    await user.click(
      screen.getByRole("button", { name: "Record Bulgarian split squat" }),
    )

    expect(
      screen.getByRole("form", { name: "Record Bulgarian split squat" }),
    ).toBeInTheDocument()

    await user.type(
      screen.getByRole("textbox", { name: "Update" }),
      "3 x 10 x 10kg{Enter}",
    )
    await user.click(screen.getByRole("radio", { name: "no change" }))

    expect(addItem).toHaveBeenCalledWith("2026/exercises/2/updates", {
      date: Temporal.Now.plainDateISO(),
      update: "3 x 10 x 10kg",
      recommendation: "no change",
    })
  })
})

// it adds a new exercise
// edits exercise name, progress date, progress
// on click highlights row
// should increase/decrease
// highlight all with same date
