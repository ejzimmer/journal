import { useEffect, useRef, useState } from "react"
import { CategoryControl } from "./CategoryControl"
import { FormModal } from "../../shared/controls/FormModal"
import { CalendarTask, Category, Task, WeeklyTask } from "./types"
import { FormControl } from "../../shared/controls/FormControl"
import { PlusIcon } from "../../shared/icons/Plus"

type MissingProps = "id" | "lastUpdated" | "status"
type NewDailyTask = Omit<Task, MissingProps>
type NewWeeklyTask = Omit<WeeklyTask, MissingProps | "completed">
type NewCalendarTask = Omit<CalendarTask, MissingProps>

export type NewTask = NewDailyTask | NewWeeklyTask | NewCalendarTask

export type AddTaskForm_OldProps = {
  categories: Category[]
  onSubmit: (task: NewTask) => void
}

export function AddTaskForm_Old({
  categories,
  onSubmit,
}: AddTaskForm_OldProps) {
  const formRef = useRef<HTMLFormElement>(null)
  const dueDateRef = useRef<HTMLInputElement>(null)
  const [type, setType] = useState<Task["type"]>("一度")
  const [category, setCategory] = useState<Category | undefined>(categories[0])
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
    }

    resetForm()
    return true
  }

  const resetForm = () => {
    setCategory(categories[0])
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
      <FormControl label="Description" />
      <label>
        Type
        <select
          value={type}
          onChange={(event) => setType(event.target.value as Task["type"])}
        >
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

type AddTaskFormProps = {
  children: React.ReactNode
  onSubmit: () => boolean
}

export function AddTaskForm({ onSubmit, children }: AddTaskFormProps) {
  const formRef = useRef<HTMLFormElement>(null)
  const formHeightRef = useRef(0)

  const [formVisible, setFormVisible] = useState(false)

  useEffect(() => {
    if (formRef.current) {
      formHeightRef.current = formRef.current.scrollHeight
    }
  }, [])

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (onSubmit()) {
      setFormVisible(false)
    }
  }

  return (
    <>
      <button
        className={`icon subtle ${formVisible ? "form-visible" : ""}`}
        onClick={() => setFormVisible(!formVisible)}
      >
        <PlusIcon width="16px" />
      </button>
      <form
        ref={formRef}
        className={formVisible ? "visible" : ""}
        style={{ height: formVisible ? formHeightRef.current : 0 }}
        onSubmit={handleSubmit}
      >
        {children}
        <div className="buttons">
          <button type="submit" className="primary">
            Create
          </button>
          <button
            type="reset"
            className="white outline"
            onClick={() => setFormVisible(false)}
          >
            Cancel
          </button>
        </div>
      </form>
    </>
  )
}
