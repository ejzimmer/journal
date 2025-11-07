import React, { useState } from "react"
import { AddTaskForm, NewTask } from "./AddTaskForm"
import { Category, Task } from "./types"

const STORAGE_KEY = "todo"

export function Today() {
  const [tasks, setTasks] = useState<Task[]>(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : []
  })

  const addTask = (task: NewTask) => {
    const id = crypto.randomUUID()
    const updatedTasks: Task[] = [
      ...tasks,
      { id, ...task, lastUpdated: Date.now(), status: "ready" },
    ]
    setTasks(updatedTasks)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedTasks))
  }

  const groupedTasks = Object.groupBy(tasks, (task) => task.type)
  const categories = new Map<string, Category>()
  tasks.forEach((task) => {
    categories.set(task.category.text, task.category)
  })

  return (
    <>
      <AddTaskForm
        onSubmit={addTask}
        categories={Array.from(categories.values())}
      />
      <ul>
        {groupedTasks["毎日"]?.map((task) => (
          <li key={task.description}>{task.description}</li>
        ))}
      </ul>
      <ul>
        {groupedTasks["週に"]?.map((task) => (
          <li key={task.description}>{task.description}</li>
        ))}
      </ul>
      <ul>
        {groupedTasks["日付"]?.map((task) => (
          <li key={task.description}>{task.description}</li>
        ))}
      </ul>
    </>
  )
}
