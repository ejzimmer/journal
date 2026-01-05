import { useContext, useState } from "react"
import { FormControl } from "../../../shared/controls/FormControl"
import { Switch } from "../../../shared/controls/Switch"
import { AddTaskForm } from "../AddTaskForm"
import { CategoryControl } from "../CategoryControl"
import { Category } from "../types"
import { CategoriesContext } from ".."
import { FirebaseContext } from "../../../shared/FirebaseContext"
import { Daily, DailyTask, PARENT_LIST } from "./types"

export function AddTodayTaskForm() {
  const storageContext = useContext(FirebaseContext)
  if (!storageContext) {
    throw new Error("Missing Firebase context provider")
  }

  const categories = useContext(CategoriesContext)
  if (!categories) {
    throw new Error("Missing categories context provider")
  }

  const [description, setDescription] = useState("")
  const [taskType, setTaskType] = useState<Daily["type"]>("一度")
  const [category, setCategory] = useState<Category | undefined>(categories[0])

  const handleSubmit = () => {
    if (!description || !category) {
      return false
    }

    storageContext.addItem<DailyTask>(PARENT_LIST, {
      description,
      category,
      type: taskType,
      status: "ready",
      lastCompleted: new Date().getTime(),
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

function CustomOption({ value }: { value?: { label: string; emoji: string } }) {
  return (
    <>
      {value?.emoji} {value?.label}
    </>
  )
}
