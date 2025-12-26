import { useState } from "react"
import { FormControl } from "../../../shared/controls/FormControl"
import { Switch } from "../../../shared/controls/Switch"
import { NewTask, AddTaskForm } from "../AddTaskForm"
import { CategoryControl } from "../CategoryControl"
import { Category, TaskType } from "../types"

type AddTodayTaskFormProps = {
  categories: Category[]
  onSubmit: (task: NewTask) => void
}

export function AddTodayTaskForm({
  categories,
  onSubmit,
}: AddTodayTaskFormProps) {
  const [description, setDescription] = useState("")
  const [taskType, setTaskType] = useState<TaskType>("一度")
  const [category, setCategory] = useState<Category | undefined>(categories[0])

  const handleSubmit = () => {
    if (!description || !category) {
      return false
    }

    onSubmit({
      description,
      category,
      type: taskType,
    })

    setDescription("")
    setTaskType("一度")
    setCategory(categories[0])

    return true
  }

  return (
    <AddTaskForm onSubmit={handleSubmit}>
      <FormControl
        label="Description"
        value={description}
        onChange={setDescription}
      />
      <fieldset>
        <legend className="label">Type</legend>
        <Switch
          options={["一度", "毎日"]}
          value={taskType}
          onChange={setTaskType}
        />
      </fieldset>
      <div>
        <div className="label">Category</div>
        <CategoryControl
          onChange={setCategory}
          options={categories}
          value={category}
        />
      </div>
    </AddTaskForm>
  )
}
