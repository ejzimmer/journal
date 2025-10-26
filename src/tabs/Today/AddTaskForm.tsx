import { useState } from "react"
import { Category, CategoryControl } from "./CategoryControl"

type BaseNewTask = {
  description: string
  category: Category
  lastUpdated: number
  type: string
}
type NewWeeklyTask = BaseNewTask & { frequency: number }
type NewCalendarTask = BaseNewTask & { dueDate: number }

type NewTask = BaseNewTask | NewWeeklyTask | NewCalendarTask

export type AddTaskFormProps = {
  categories: Category[]
  onSubmit: (task: NewTask) => void
}

export function AddTaskForm({ categories, onSubmit }: AddTaskFormProps) {
  const [category, setCategory] = useState<Category>()
  const [errors, setErrors] = useState<string[]>([])

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!event.currentTarget) return

    const errors = []
    const [
      description,
      type,
      categoryName,
      emoji,
      category,
      frequency,
      dueDate,
    ] = Array.from(event.currentTarget.elements) as HTMLInputElement[]

    if (!description.value) {
      errors.push("Description required")
    }
    if (type.value === "日付" && !dueDate.value) {
      errors.push("Due date required")
    }
    if (categoryName.value && !emoji.value) {
      errors.push("Pick an emoji for the category")
    }

    setErrors(errors)

    if (errors.length > 0) return

    const getCategory = (): Category => {
      if (categoryName.value) {
        return { text: categoryName.value, emoji: emoji.value }
      }

      const selectedEmoji = category.value
      const selected = categories.find(({ emoji }) => emoji === selectedEmoji)
      return selected ?? categories[0]
    }

    switch (type.value) {
      case "日付":
        onSubmit({
          description: description.value,
          category: getCategory(),
          lastUpdated: Date.now(),
          type: type.value,
          dueDate: new Date(dueDate.value).getTime(),
        })
        break
      case "週に":
        const freq = Number.parseInt(frequency.value)
        onSubmit({
          description: description.value,
          frequency: isNaN(freq) ? 1 : freq,
          category: getCategory(),
          lastUpdated: Date.now(),
          type: type.value,
        })
        break
      default:
        onSubmit({
          description: description.value,
          category: getCategory(),
          lastUpdated: Date.now(),
          type: type.value,
        })
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <label>
        Description
        <input />
      </label>
      <label>
        Type
        <select>
          <option></option>
          <option>毎日</option>
          <option>週に</option>
          <option>日付</option>
          <option>目標</option>
        </select>
      </label>
      <label>
        Category
        <CategoryControl onChange={setCategory} options={[]} />
      </label>
      <label>
        Category
        <select>
          {categories.map(({ text, emoji }) => (
            <option key={text}>{emoji}</option>
          ))}
        </select>
      </label>

      <label>
        Frequency <input min="1" step="1" type="number" />
      </label>
      <label>
        Due date <input type="date" />
      </label>
      {errors.map((e) => (
        <div key={e}>{e}</div>
      ))}
      <button type="submit">Create task</button>
    </form>
  )
}
