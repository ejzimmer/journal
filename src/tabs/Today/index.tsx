import React, { useState } from "react"
import { AddTaskForm, NewTask } from "./AddTaskForm"
import { Modal } from "../../shared/controls/Modal"

export function Today() {
  const [tasks, setTasks] = useState<NewTask[]>([])

  return (
    <>
      <Modal trigger={(props) => <button {...props}>Add task</button>}>
        <AddTaskForm
          onSubmit={(task) => setTasks([...tasks, task])}
          categories={[{ text: "Chore", emoji: "🧹" }]}
        />
      </Modal>
      <ul>
        {tasks.map((task) => (
          <li key={task.description}>{task.description}</li>
        ))}
      </ul>
    </>
  )
}
