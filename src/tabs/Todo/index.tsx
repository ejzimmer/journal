import React, { useState } from "react"
import { AddTaskForm, NewTask } from "./AddTaskForm"
import { Category, Task } from "./types"
import { EditableText } from "../../shared/controls/EditableText"

const STORAGE_KEY = "todo"

export function Today() {
  const [tasks, setTasks] = useState<Task[]>(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : []
  })

  const saveTasks = (tasks: Task[]) => {
    setTasks(tasks)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks))
  }

  const addTask = (task: NewTask) => {
    const id = crypto.randomUUID()
    saveTasks([
      ...tasks,
      { id, ...task, lastUpdated: Date.now(), status: "ready" },
    ])
  }

  const groupedTasks = Object.groupBy(tasks, (task) => task.type)
  const categories = new Map<string, Category>()
  tasks.forEach((task) => {
    categories.set(task.category.text, task.category)
  })

  const updateTask = (task: Task) => {
    const index = tasks.findIndex((t) => t.id === task.id)
    if (index > -1) {
      saveTasks(tasks.with(index, task))
    }
  }

  const deleteTask = (task: Task) => {
    const index = tasks.findIndex((t) => t.id === task.id)
    if (index > -1) {
      saveTasks(tasks.toSpliced(index, 1))
    }
  }

  return (
    <>
      <AddTaskForm
        onSubmit={addTask}
        categories={Array.from(categories.values())}
      />
      <div style={{ display: "flex", flexWrap: "wrap", gap: "80px" }}>
        <TaskList
          tasks={groupedTasks["毎日"]}
          onChangeTask={updateTask}
          onDeleteTask={deleteTask}
        />
        <TaskList
          tasks={groupedTasks["週に"]}
          onChangeTask={updateTask}
          onDeleteTask={deleteTask}
        />
        <TaskList
          tasks={groupedTasks["日付"]}
          onChangeTask={updateTask}
          onDeleteTask={deleteTask}
        />
      </div>
    </>
  )
}

type TaskListProps = {
  tasks?: Task[]
  onChangeTask: (task: Task) => void
  onDeleteTask: (task: Task) => void
}
function TaskList({ tasks, onChangeTask, onDeleteTask }: TaskListProps) {
  if (!tasks) {
    return <div>No tasks</div>
  }

  return (
    <ul>
      {tasks.map((task) => (
        <li
          key={task.description}
          style={{ display: "flex", gap: "10px", alignItems: "center" }}
        >
          <EditableText
            label="description"
            onChange={(description) => onChangeTask({ ...task, description })}
          >
            {task.description}
          </EditableText>
          <button onClick={() => onDeleteTask(task)}>Delete</button>
        </li>
      ))}
    </ul>
  )
}
