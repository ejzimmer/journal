import React from "react"
import { render, screen } from "@testing-library/react"
import { StartOfDayForm } from "./StartOfDayForm"
import userEvent from "@testing-library/user-event"

const commonProps = {
  categories: [
    { text: "Chore", emoji: "🧹" },
    { text: "Knitting", emoji: "🧶" },
  ],
  dueGoals: [
    {
      id: "1",
      description: "Mobility training (2 remaining this week)",
      category: { text: "exercise", emoji: "🏃‍♀️" },
    },
    {
      id: "2",
      description: "Japanese lesson (due tomorrow)",
      category: { text: "exercise", emoji: "🏃‍♀️" },
    },
    {
      id: "3",
      description: "Rollerskating (due tomorrow)",
      category: { text: "exercise", emoji: "🏃‍♀️" },
    },
  ],
  rolledOverGoals: [],
}

const rolledOverGoals = [
  {
    id: "4",
    description: "Cut out shirt",
    category: { text: "Sewing", emoji: "🪡" },
  },
  {
    id: "5",
    description: "Taxes",
    category: { text: "Finances", emoji: "💰" },
  },
]

describe("StartOfDayForm", () => {
  it("can add up to 3 goals, not based on any existing task", async () => {
    const user = userEvent.setup()
    const onSubmit = jest.fn()
    render(<StartOfDayForm {...commonProps} onSubmit={onSubmit} />)

    expect(screen.getAllByRole("textbox")).toHaveLength(3)
    expect(screen.getAllByRole("combobox")).toHaveLength(3)

    await user.type(screen.getAllByRole("textbox")[0], "Clean bathroom")
    await user.type(screen.getAllByRole("textbox")[1], "Finish sock toes")
    await user.selectOptions(screen.getAllByRole("combobox")[1], "🧶")
    await user.keyboard("{Tab}{Enter}")

    expect(onSubmit).toHaveBeenCalledWith([
      {
        description: "Clean bathroom",
        category: { text: "Chore", emoji: "🧹" },
      },
      {
        description: "Finish sock toes",
        category: { text: "Knitting", emoji: "🧶" },
      },
    ])
  })

  describe("when there are suggested goals", () => {
    it("adds a checkbox for each one, initially unchecked", async () => {
      const user = userEvent.setup()
      const onSubmit = jest.fn()
      render(<StartOfDayForm {...commonProps} onSubmit={onSubmit} />)

      commonProps.dueGoals.forEach((goal) => {
        const goalCheckbox = screen.getByRole("checkbox", {
          name: goal.description,
        })
        expect(goalCheckbox).toBeInTheDocument()
        expect(goalCheckbox).not.toBeChecked()
      })

      await user.click(
        screen.getByRole("checkbox", {
          name: "Mobility training (2 remaining this week)",
        })
      )
      await user.click(
        screen.getByRole("checkbox", {
          name: "Japanese lesson (due tomorrow)",
        })
      )
      await user.keyboard("{Enter}")

      expect(onSubmit).toHaveBeenCalledWith([
        commonProps.dueGoals[0],
        commonProps.dueGoals[1],
      ])
    })
  })

  describe("when there are incomplete goals from the previous day", () => {
    it("adds a checkbox for each one, checked", async () => {
      const user = userEvent.setup()
      const onSubmit = jest.fn()
      render(
        <StartOfDayForm
          {...commonProps}
          onSubmit={onSubmit}
          rolledOverGoals={rolledOverGoals}
        />
      )

      rolledOverGoals.forEach((goal) => {
        const goalCheckbox = screen.getByRole("checkbox", {
          name: goal.description,
        })
        expect(goalCheckbox).toBeInTheDocument()
        expect(goalCheckbox).toBeChecked()
      })

      await user.click(
        screen.getByRole("checkbox", {
          name: "Mobility training (2 remaining this week)",
        })
      )
      await user.keyboard("{Enter}")

      expect(onSubmit).toHaveBeenCalledWith([
        rolledOverGoals[0],
        rolledOverGoals[1],
        commonProps.dueGoals[0],
      ])
    })
  })

  it("does not allow adding more than 3 goals", async () => {
    const user = userEvent.setup()
    const onSubmit = jest.fn()
    render(
      <StartOfDayForm
        {...commonProps}
        onSubmit={onSubmit}
        rolledOverGoals={rolledOverGoals}
      />
    )

    expect(screen.getAllByRole("textbox")).toHaveLength(1)

    await user.click(
      screen.getByRole("checkbox", { name: rolledOverGoals[0].description })
    )
    expect(screen.getAllByRole("textbox")).toHaveLength(2)

    await user.click(
      screen.getByRole("checkbox", {
        name: commonProps.dueGoals[0].description,
      })
    )
    await user.click(
      screen.getByRole("checkbox", {
        name: commonProps.dueGoals[1].description,
      })
    )
    expect(screen.queryAllByRole("textbox")).toHaveLength(0)

    await user.click(
      screen.getByRole("checkbox", {
        name: commonProps.dueGoals[2].description,
      })
    )
    await user.keyboard("{Enter}")
    expect(onSubmit).not.toHaveBeenCalled()
    expect(screen.getByText("Only 3 goals permitted")).toBeInTheDocument()
  })
})
