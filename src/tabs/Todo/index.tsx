import React, { useEffect, useState } from "react"
import { AddTaskForm_Old, NewTask } from "./AddTaskForm"
import { Category, isCalendarTask, isWeeklyTask, Task } from "./types"
import { dailyReset } from "./dailyReset"
import { hoursToMilliseconds } from "date-fns"
import { TodayList } from "./Today/TodayList"
import { RestartArrowIcon } from "../../shared/icons/RestartArrow"
import { ThisWeekList } from "./ThisWeek/ThisWeekList"
import { DueDateList } from "./DueDate/DueDateList"

import "./index.css"

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

  // For the categories dropdown
  const categories = new Map<string, Category>()
  tasks.forEach((task) => {
    categories.set(task.category.text, task.category)
  })

  const updateTask = (task: Task) => {
    const index = tasks.findIndex((t) => t.id === task.id)
    if (index > -1) {
      saveTasks(
        tasks.with(index, { ...task, lastUpdated: new Date().getTime() })
      )
    }
  }

  const deleteTask = (task: Task) => {
    const index = tasks.findIndex((t) => t.id === task.id)
    if (index > -1) {
      saveTasks(tasks.toSpliced(index, 1))
    }
  }

  useEffect(() => {
    console.log("tasks changed, effect fired")
    const timer = setTimeout(() => {
      console.log("reset timer ended, updating tasks")
      setTasks(dailyReset(tasks))
    }, hoursToMilliseconds(1))

    return () => clearTimeout(timer)
  }, [tasks])

  return (
    <>
      <AddTaskForm_Old
        onSubmit={addTask}
        categories={Array.from(categories.values())}
      />
      <button className="ghost" onClick={() => setTasks(dailyReset(tasks))}>
        <RestartArrowIcon width="20px" />
      </button>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "80px" }}>
        <TodayList
          tasks={[
            ...(groupedTasks["毎日"] ?? []),
            ...(groupedTasks["一度"] ?? []),
          ]}
          onChangeTask={updateTask}
          onDeleteTask={deleteTask}
          onCreateTask={addTask}
          categories={categories.values().toArray()}
        />
        <ThisWeekList
          tasks={tasks.filter(isWeeklyTask)}
          onChangeTask={updateTask}
          onDeleteTask={deleteTask}
          onCreateTask={addTask}
          categories={categories.values().toArray()}
        />
        <DueDateList
          tasks={tasks.filter(isCalendarTask)}
          onChangeTask={updateTask}
          onDeleteTask={deleteTask}
          onCreateTask={addTask}
          categories={categories.values().toArray()}
        />
      </div>
    </>
  )
}
