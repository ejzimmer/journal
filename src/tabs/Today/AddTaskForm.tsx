import { useRef, useState } from "react"
import { Category, CategoryControl } from "./CategoryControl"
import { FormModal } from "../../shared/controls/FormModal"

type BaseNewTask = {
  description: string
  category: Category
  lastUpdated: number
  type: string
}
type NewWeeklyTask = BaseNewTask & { frequency: number }
type NewCalendarTask = BaseNewTask & { dueDate: number }

export type NewTask = BaseNewTask | NewWeeklyTask | NewCalendarTask

export type AddTaskFormProps = {
  categories: Category[]
  onSubmit: (task: NewTask) => void
}

export function AddTaskForm({ categories, onSubmit }: AddTaskFormProps) {
  const dueDateRef = useRef<HTMLInputElement>(null)
  const [category, setCategory] = useState<Category | undefined>(categories[0])
  const [frequency, setFrequency] = useState<string | undefined>("1")
  const [errors, setErrors] = useState<string[]>([])

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>): boolean => {
    if (!event.currentTarget) {
      return false
    }

    const errors = []
    const [description, type] = Array.from(
      event.currentTarget.elements
    ) as HTMLInputElement[]

    if (!description.value) {
      errors.push("Description required")
    }
    if (!category) {
      return false
    }
    if (type.value === "日付" && !dueDateRef.current?.value) {
      errors.push("Due date required")
    }
    if (
      type.value === "週に" &&
      (!frequency || isNaN(Number.parseInt(frequency)))
    ) {
      errors.push("Frequency required")
    }
    if (category?.text && !category.emoji) {
      errors.push("Pick an emoji for the category")
    }

    setErrors(errors)

    if (errors.length > 0) {
      return false
    }

    switch (type.value) {
      case "日付":
        onSubmit({
          description: description.value,
          category,
          lastUpdated: Date.now(),
          type: type.value,
          dueDate: new Date(dueDateRef.current?.value as string).getTime(),
        })
        break
      case "週に":
        onSubmit({
          description: description.value,
          frequency: Number.parseInt(frequency as string),
          category,
          lastUpdated: Date.now(),
          type: type.value,
        })
        break
      default:
        onSubmit({
          description: description.value,
          category,
          lastUpdated: Date.now(),
          type: type.value,
        })
    }
    return true
  }

  return (
    <FormModal
      trigger={(props) => <button {...props}>Add task</button>}
      onSubmit={handleSubmit}
      onClose={() => setErrors([])}
      submitButtonText="Create task"
    >
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
        <CategoryControl
          onChange={setCategory}
          options={categories}
          value={category}
        />
      </label>

      <label>
        Frequency
        <input
          min="1"
          step="1"
          type="number"
          onChange={(event) => {
            setFrequency(event.target.value)
          }}
        />
      </label>
      <label>
        Due date <input type="date" ref={dueDateRef} />
      </label>
      {errors.map((e) => (
        <div key={e}>{e}</div>
      ))}
    </FormModal>
  )
}
