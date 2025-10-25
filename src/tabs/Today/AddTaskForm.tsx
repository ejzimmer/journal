import { useState } from "react"

type BaseNewTask = {
  description: string
  category: [string, string]
  lastUpdated: number
  type: string
}
type NewWeeklyTask = BaseNewTask & { frequency: number }
type NewCalendarTask = BaseNewTask & { dueDate: number }

type NewTask = BaseNewTask | NewWeeklyTask | NewCalendarTask

export type AddTaskFormProps = {
  categories: [string, string][]
  onSubmit: (task: NewTask) => void
}

export function AddTaskForm({ categories, onSubmit }: AddTaskFormProps) {
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

    const getCategory = (): [string, string] => {
      if (categoryName.value) {
        return [categoryName.value, emoji.value]
      }

      const selectedEmoji = category.value
      const selected = categories.find(([, e]) => e === selectedEmoji)
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
        Label <input />
      </label>
      <label>
        Emoji <input />
      </label>
      <label>
        Category
        <select>
          {categories.map(([text, icon]) => (
            <option key={text}>{icon}</option>
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
