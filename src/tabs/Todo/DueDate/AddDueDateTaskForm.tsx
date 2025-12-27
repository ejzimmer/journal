import { useState } from "react"
import { FormControl } from "../../../shared/controls/FormControl"
import { NewTask, AddTaskForm } from "../AddTaskForm"
import { CategoryControl } from "../CategoryControl"
import { Category } from "../types"

type AddDueDateFormProps = {
  categories: Category[]
  onSubmit: (task: NewTask) => void
}

export function AddDueDateTaskForm({
  categories,
  onSubmit,
}: AddDueDateFormProps) {
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

    onSubmit({
      description,
      category,
      type: "週に",
      frequency: Number.parseInt(frequency),
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
