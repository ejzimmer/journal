import { useRef, useState } from "react"
import { CategoryControl } from "./CategoryControl"
import { FormModal } from "../../shared/controls/FormModal"
import { CalendarTask, Category, Task, WeeklyTask } from "./types"

type MissingProps = "id" | "lastUpdated" | "status"
type NewDailyTask = Omit<Task, MissingProps>
type NewWeeklyTask = Omit<WeeklyTask, MissingProps | "completed">
type NewCalendarTask = Omit<CalendarTask, MissingProps>

export type NewTask = NewDailyTask | NewWeeklyTask | NewCalendarTask

export type AddTaskFormProps = {
  categories: Category[]
  onSubmit: (task: NewTask) => void
}

export function AddTaskForm({ categories, onSubmit }: AddTaskFormProps) {
  const formRef = useRef<HTMLFormElement>(null)
  const dueDateRef = useRef<HTMLInputElement>(null)
  const [type, setType] = useState<Task["type"]>("毎日")
  const [category, setCategory] = useState<Category | undefined>(categories[0])
  const [frequency, setFrequency] = useState<string | undefined>("1")
  const [errors, setErrors] = useState<string[]>([])

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>): boolean => {
    if (!event.currentTarget) {
      return false
    }

    const errors = []
    const [description] = Array.from(
      event.currentTarget.elements
    ) as HTMLInputElement[]

    if (!description.value) {
      errors.push("Description required")
    }
    if (!category) {
      return false
    }
    if (type === "日付" && !dueDateRef.current?.value) {
      errors.push("Due date required")
    }
    if (type === "週に" && (!frequency || isNaN(Number.parseInt(frequency)))) {
      errors.push("Frequency required")
    }
    if (category?.text && !category.emoji) {
      errors.push("Pick an emoji for the category")
    }

    setErrors(errors)

    if (errors.length > 0) {
      return false
    }

    switch (type) {
      case "日付":
        onSubmit({
          description: description.value,
          category,
          type,
          dueDate: new Date(dueDateRef.current?.value as string).getTime(),
        })
        break
      case "週に":
        onSubmit({
          description: description.value,
          frequency: Number.parseInt(frequency as string),
          category,
          type,
        })
        break
      default:
        onSubmit({
          description: description.value,
          category,
          type: "毎日",
        })
    }

    resetForm()
    return true
  }

  const resetForm = () => {
    setCategory(categories[0])
    setFrequency("1")
    setErrors([])
    formRef.current?.reset()
  }

  return (
    <FormModal
      formRef={formRef}
      trigger={(props) => <button {...props}>Add task</button>}
      onSubmit={handleSubmit}
      onClose={() => {
        resetForm()
      }}
      submitButtonText="Create task"
    >
      <label>
        Description
        <input />
      </label>
      <label>
        Type
        <select
          value={type}
          onChange={(event) => setType(event.target.value as Task["type"])}
        >
          <option>毎日</option>
          <option>週に</option>
          <option>日付</option>
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

      {type === "週に" && (
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
      )}
      {type === "日付" && (
        <label>
          Due date <input type="date" ref={dueDateRef} />
        </label>
      )}
      {errors.map((e) => (
        <div key={e}>{e}</div>
      ))}
    </FormModal>
  )
}
