import { useState } from "react"
import { FormControl } from "../../../shared/controls/FormControl"
import { NewTask, AddTaskForm } from "../AddTaskForm"
import { CategoryControl } from "../CategoryControl"
import { Category } from "../types"
import { EditableDate } from "../../../shared/controls/EditableDate"

type AddThisWeekFormProps = {
  categories: Category[]
  onSubmit: (task: NewTask) => void
}

export function AddThisWeekTaskForm({
  categories,
  onSubmit,
}: AddThisWeekFormProps) {
  const [description, setDescription] = useState("")
  const [category, setCategory] = useState<Category | undefined>(categories[0])
  const [dueDate, setDueDate] = useState<number>(new Date().getDate())

  const handleSubmit = () => {
    if (!description || !category || !dueDate) {
      return false
    }

    onSubmit({
      description,
      category,
      type: "日付",
      dueDate: new Date(dueDate).getDate(),
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
      <div style={{ display: "flex", gap: "16px" }}>
        <div>
          <div className="label">Category</div>
          <CategoryControl
            onChange={setCategory}
            options={categories}
            value={category}
          />
        </div>
        <EditableDate value={dueDate} onChange={setDueDate} />
      </div>
    </AddTaskForm>
  )
}
