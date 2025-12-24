import { useEffect, useRef, useState } from "react"
import { Category, Task, TaskListProps, TaskType } from "../types"
import { TodayTask } from "./TodayTask"
import { PlusIcon } from "../../../shared/icons/Plus"
import { FormControl } from "../../../shared/controls/FormControl"
import { Switch } from "../../../shared/controls/Switch"
import { CategoryControl } from "../CategoryControl"

import "./TodayList.css"
import { NewTask } from "../AddTaskForm"

export function TodayList({
  tasks,
  onChangeTask,
  onDeleteTask,
  onCreateTask,
  categories,
}: TaskListProps<Task>) {
  if (!tasks) {
    return <div>No tasks for today</div>
  }

  return (
    <div className="todo-task-list">
      <ul>
        {tasks.map((task) => (
          <li key={task.id}>
            <TodayTask
              task={task}
              onChange={onChangeTask}
              onDelete={() => onDeleteTask(task)}
            />
          </li>
        ))}
      </ul>
      <AddTaskForm categories={categories} onSubmit={onCreateTask} />
    </div>
  )
}

type AddTaskFormProps = {
  categories: Category[]
  onSubmit: (task: NewTask) => void
}

function AddTaskForm({ categories, onSubmit }: AddTaskFormProps) {
  const formRef = useRef<HTMLFormElement>(null)
  const formHeightRef = useRef(0)
  const [formVisible, setFormVisible] = useState(false)

  const [description, setDescription] = useState("")
  const [taskType, setTaskType] = useState<TaskType>("一度")
  const [category, setCategory] = useState<Category | undefined>(categories[0])

  useEffect(() => {
    if (formRef.current) {
      formHeightRef.current = formRef.current.scrollHeight
    }
  }, [])

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

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
    setFormVisible(false)
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
