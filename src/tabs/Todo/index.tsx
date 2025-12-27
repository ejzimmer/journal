import React, { useState } from "react"
import { NewTask } from "./AddTaskForm"
import { CalendarTask, Category, Task, WeeklyTask } from "./types"
import { TodayList } from "./Today/TodayList"
import { ThisWeekList } from "./ThisWeek/ThisWeekList"
import { DueDateList } from "./DueDate/DueDateList"

import "./index.css"

const STORAGE_KEY = "todo"

type Tasks = Record<Task["type"], Task[]>

export function Today() {
  const [tasks, setTasks] = useState<Tasks>(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : {}
  })

  const saveTasks = (tasks: Tasks) => {
    setTasks(tasks)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks))
  }

  const addTask = (task: NewTask) => {
    const id = crypto.randomUUID()
    saveTasks({
      ...tasks,
      [task.type]: [
        ...tasks[task.type],
        { id, ...task, lastUpdated: Date.now(), status: "ready" },
      ],
    })
  }

  // For the categories dropdown
  const categories = new Map<string, Category>()
  Object.values(tasks)
    .flat()
    .forEach((task) => {
      categories.set(task.category.text, task.category)
    })

  const updateTask = (task: Task) => {
    const tasksOfType = tasks[task.type]
    const index = tasksOfType.findIndex((t) => t.id === task.id)
    if (index > -1) {
      saveTasks({
        ...tasks,
        [task.type]: tasksOfType.with(index, {
          ...task,
          lastUpdated: new Date().getTime(),
        }),
      })
    }
  }

  const deleteTask = (task: Task) => {
    const tasksOfType = tasks[task.type]
    const index = tasksOfType.findIndex((t) => t.id === task.id)
    if (index > -1) {
      saveTasks({
        ...tasks,
        [task.type]: tasksOfType.toSpliced(index, 1),
      })
    }
  }
  return (
    <>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "80px" }}>
        <TodayList
          tasks={[...(tasks["毎日"] ?? []), ...(tasks["一度"] ?? [])]}
          onChangeTask={updateTask}
          onDeleteTask={deleteTask}
          onCreateTask={addTask}
          categories={categories.values().toArray()}
        />
        <ThisWeekList
          tasks={tasks["週に"] as WeeklyTask[]}
          onChangeTask={updateTask}
          onDeleteTask={deleteTask}
          onCreateTask={addTask}
          categories={categories.values().toArray()}
        />
        <DueDateList
          tasks={tasks["日付"] as CalendarTask[]}
          onChangeTask={updateTask}
          onDeleteTask={deleteTask}
          onCreateTask={addTask}
          categories={categories.values().toArray()}
        />
      </div>
    </>
  )
}
