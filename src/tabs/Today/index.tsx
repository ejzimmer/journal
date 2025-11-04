import React, { useState } from "react"
import { AddTaskForm, NewTask } from "./AddTaskForm"

export function Today() {
  const [tasks, setTasks] = useState<NewTask[]>([])

  return (
    <>
      <AddTaskForm
        onSubmit={(task) => setTasks([...tasks, task])}
        categories={[{ text: "Chore", emoji: "🧹" }]}
      />
      <ul>
        {tasks.map((task) => (
          <li key={task.description}>{task.description}</li>
        ))}
      </ul>
    </>
  )
}
