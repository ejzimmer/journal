import { Fragment } from "react/jsx-runtime"
import { Category } from "./CategoryControl"
import { useMemo, useState } from "react"

type StartOfDayFormProps = {
  onSubmit: (goals: (Goal | NewGoal)[]) => void
  categories: Category[]
  dueGoals: Goal[]
  rolledOverGoals: Goal[]
}

type Goal = {
  id: string
  description: string
  category: Category
}

type NewGoal = Omit<Goal, "id">

export function StartOfDayForm({
  categories,
  onSubmit,
  dueGoals,
  rolledOverGoals,
}: StartOfDayFormProps) {
  const suggestedGoals = useMemo(
    () => [...rolledOverGoals, ...dueGoals],
    [rolledOverGoals, dueGoals]
  )
  const suggestedGoalsState = useMemo(() => {
    const goalsMap = new Map<string, boolean>()
    dueGoals.forEach((g) => goalsMap.set(g.id, false))
    rolledOverGoals.forEach((g) => goalsMap.set(g.id, true))
    return goalsMap
  }, [dueGoals, rolledOverGoals])

  const [newGoals, setNewGoals] = useState<NewGoal[]>(() => {
    const existingGoalsCount = rolledOverGoals.length
    if (existingGoalsCount >= 3) {
      return []
    }

    return Array.from({ length: 3 - existingGoalsCount }).map(() => ({
      description: "",
      category: categories[0],
    }))
  })
  const [error, setError] = useState("")

  const handleClickGoal = (event: React.ChangeEvent<HTMLInputElement>) => {
    const id = event.target.value
    suggestedGoalsState.set(id, event.target.checked)

    if (event.target.checked) {
      setNewGoals(newGoals.slice(0, newGoals.length - 1))
    } else {
      setNewGoals([...newGoals, { description: "", category: categories[0] }])
    }
  }

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()

    const selectedSuggestedGoals = suggestedGoals.filter((g) =>
      suggestedGoalsState.get(g.id)
    )
    if (selectedSuggestedGoals.length > 3) {
      setError("Only 3 goals permitted")
      return
    }

    onSubmit([
      ...selectedSuggestedGoals,
      ...newGoals.filter((g) => !!g.description),
    ])
  }

  return (
    <form onSubmit={handleSubmit}>
      {suggestedGoals.map((goal) => (
        <label key={goal.id}>
          <input
            type="checkbox"
            value={goal.id}
            onChange={handleClickGoal}
            checked={suggestedGoalsState.get(goal.id)}
          />
          {goal.description}
        </label>
      ))}
      {newGoals.map((_, index) => (
        <Fragment key={index}>
          <input
            value={newGoals[index].description}
            onChange={(event) => {
              setNewGoals(
                newGoals.with(index, {
                  ...newGoals[index],
                  description: event.target.value,
                })
              )
            }}
          />
          <select
            value={
              (
                categories.find(
                  (c) =>
                    c.text === newGoals[index].category.text &&
                    c.emoji === newGoals[index].category.emoji
                ) ?? categories[0]
              ).emoji
            }
            onChange={(event) => {
              setNewGoals(
                newGoals.with(index, {
                  ...newGoals[index],
                  category:
                    categories.find((c) => c.emoji === event.target.value) ??
                    categories[0],
                })
              )
            }}
          >
            {categories.map((o) => (
              <option key={o.text} value={o.emoji}>
                {o.emoji}
              </option>
            ))}
          </select>
        </Fragment>
      ))}
      {error}
      <button>submit</button>
    </form>
  )
}
