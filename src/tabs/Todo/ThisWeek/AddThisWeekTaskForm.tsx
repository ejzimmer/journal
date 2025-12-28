import { useContext, useState } from "react"
import { FormControl } from "../../../shared/controls/FormControl"
import { AddTaskForm } from "../AddTaskForm"
import { CategoryControl } from "../CategoryControl"
import { Category } from "../types"
import { CategoriesContext } from ".."
import { FirebaseContext } from "../../../shared/FirebaseContext"
import { PARENT_LIST, WeeklyTask } from "./types"

export function AddThisWeekTaskForm() {
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
  const [frequency, setFrequency] = useState<string | undefined>("1")

  const handleSubmit = () => {
    if (
      !description ||
      !category ||
      !frequency ||
      isNaN(Number.parseInt(frequency))
    ) {
      return false
    }

    storageContext.addItem<WeeklyTask>(PARENT_LIST, {
      description,
      category,
      frequency: Number.parseInt(frequency),
      completed: [],
    })

    setDescription("")
    setCategory(categories[0])
    setFrequency("1")

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
        <FormControl
          type="number"
          label="Frequency"
          value={frequency}
          size={2}
          onChange={setFrequency}
        />
      </div>
    </AddTaskForm>
  )
}
