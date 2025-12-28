import { useId, useState } from "react"
import { FormControl } from "../../../shared/controls/FormControl"
import { AddTaskForm } from "../AddTaskForm"
import { CategoryControl } from "../CategoryControl"
import { Category, Task } from "../types"
import { EditableDate } from "../../../shared/controls/EditableDate"

export type TaskDetails = {
  description: Task["description"]
  category: Task["category"]
  dueDate: number
}

type AddDueDateFormProps = {
  categories: Category[]
  onSubmit: (task: TaskDetails) => void
}

export function AddDueDateTaskForm({
  categories,
  onSubmit,
}: AddDueDateFormProps) {
  const [description, setDescription] = useState("")
  const [category, setCategory] = useState<Category | undefined>(categories[0])
  const [dueDate, setDueDate] = useState<number>(new Date().getDate())

  const dueDateId = useId()

  const handleSubmit = () => {
    if (!description || !category || !dueDate) {
      return false
    }

    onSubmit({
      description,
      category,
      dueDate,
    })

    setDescription("")
    setCategory(categories[0])
    setDueDate(new Date().getDate())

    return true
  }

  return (
    <AddTaskForm onSubmit={handleSubmit}>
      <FormControl
        label="Description"
        value={description}
        onChange={setDescription}
      />
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gridTemplateRows: "min-content 1fr",
          gridAutoFlow: "column",
          gap: "2px 12px",
        }}
      >
        <div className="label">Category</div>
        <CategoryControl
          onChange={setCategory}
          options={categories}
          value={category}
        />
        <label className="label" htmlFor={dueDateId}>
          Due date
        </label>
        <div style={{ fontSize: "24px" }}>
          <EditableDate id={dueDateId} value={dueDate} onChange={setDueDate} />
        </div>
      </div>
    </AddTaskForm>
  )
}
