import { render, screen, within } from "@testing-library/react"
import { ExerciseTracker } from "./ExerciseTracker"
import userEvent from "@testing-library/user-event"

const exercises = [
  {
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
    name: "Bulgarian split squat",
    updates: [{ date: new Date("2026-08-12"), update: "3 x 10 x 8kg" }],
  },
  {
    name: "B-stance RDL",
    updates: [
      { date: new Date("2026-08-12"), update: "3 x 10 x 16kg" },
      { date: new Date("2026-08-16"), update: "3 x 10 x 20kg" },
      { date: new Date("2026-08-20"), update: "3 x 10 x 20kg" },
    ],
  },
]

describe("ExerciseTracker", () => {
  it("shows previously tracked exercises", () => {
    render(<ExerciseTracker exercises={exercises} />)

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
  })

  describe("when the user clicks the add update button", () => {
    describe("and there's an empty cell in the row", () => {
      it("shows the form in the first empty cell", async () => {
        const user = userEvent.setup()
        render(<ExerciseTracker exercises={exercises} />)

        const boxSquatRow = screen.getByRole("row", {
          name: /Box pistol squat/,
        })
        const firstEmptyCell = within(boxSquatRow).getAllByRole("cell").at(1)
        if (!firstEmptyCell) {
          throw new Error("Missing last cell")
        }
        expect(firstEmptyCell.innerHTML).toBe("")

        await user.click(
          screen.getByRole("button", { name: "Record Box pistol squat" }),
        )

        const form = within(firstEmptyCell).getByRole("form", {
          name: "Record Box pistol squat",
        })
        expect(form).toBeInTheDocument()
        const dateInput = screen.getByLabelText("Date")
        expect(dateInput).toHaveFocus()
        expect(
          screen.getByRole("textbox", { name: "Update" }),
        ).toBeInTheDocument()
      })
    })
  })
})
// it adds a new exercise
// tracks exercise progress
// displays exercise progress
// edits exercise name, progress date, progress
// on click highlights row
// should increase/decrease
// highlight all with same date
