import { useContext, useId, useState } from "react"
import { FormControl } from "../../../shared/controls/FormControl"
import { AddTaskForm } from "../AddTaskForm"
import { CategoryControl } from "../CategoryControl"
import { Category } from "../types"
import { EditableDate } from "../../../shared/controls/EditableDate"
import { FirebaseContext } from "../../../shared/FirebaseContext"
import { CategoriesContext } from ".."
import { CalendarTask, PARENT_LIST } from "./types"

export function AddDueDateTaskForm() {
  const storageContext = useContext(FirebaseContext)
  if (!storageContext) {
    throw new Error("Missing Firebase context provider")
  }

  const categories = useContext(CategoriesContext)
  if (!categories) {
    throw new Error("Missing categories context provider")
  }

  const [description, setDescription] = useState("")
  const [category, setCategory] = useState<Category | undefined>(categories[0])
  const [dueDate, setDueDate] = useState<number>(new Date().getTime())

  const dueDateId = useId()

  const handleSubmit = () => {
    if (!description || !category || !dueDate) {
      return false
    }

    storageContext.addItem<CalendarTask>(PARENT_LIST, {
      description,
      category,
      dueDate,
      status: "ready",
    })

    setDescription("")
    setCategory(categories[0])
    setDueDate(new Date().getTime())

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
