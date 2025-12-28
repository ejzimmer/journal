import React, { useState } from "react"
import { Category, Task } from "./types"
import { DailyTask, TodayList } from "./Today/TodayList"
import { ThisWeekList, WeeklyTask } from "./ThisWeek/ThisWeekList"
import { CalendarTask, DueDateList } from "./DueDate/DueDateList"

import "./index.css"

const STORAGE_KEY = "todo"

type Tasks = {
  日: DailyTask[]
  週: WeeklyTask[]
  暦: CalendarTask[]
}

export function Today() {
  const [tasks, setTasks] = useState<Tasks>(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    const parsed = stored ? JSON.parse(stored) : {}
    return {
      日: parsed.日 ?? [],
      週: parsed.週 ?? [],
      暦: parsed.暦 ?? [],
    }
  })

  const updateList = (listName: string, list: Task[]) => {
    const updatedTasks = { ...tasks, [listName]: list }
    setTasks(updatedTasks)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedTasks))
  }

  // For the categories dropdown
  const categories = new Map<string, Category>()
  Object.values(tasks)
    .flat()
    .forEach((task) => {
      categories.set(task.category.text, task.category)
    })

  return (
    <>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "80px" }}>
        <TodayList
          tasks={tasks["日"]}
          categories={categories.values().toArray()}
          onUpdateList={(tasks) => updateList("日", tasks)}
          createTask={(taskDetails) => ({
            id: crypto.randomUUID(),
            ...taskDetails,
          })}
        />
        <ThisWeekList
          tasks={tasks["週"]}
          categories={categories.values().toArray()}
          onUpdateList={(tasks) => updateList("週", tasks)}
          createTask={(taskDetails) => ({
            id: crypto.randomUUID(),
            ...taskDetails,
          })}
        />
        <DueDateList
          tasks={tasks["暦"] as CalendarTask[]}
          categories={categories.values().toArray()}
          onUpdateList={(tasks) => updateList("暦", tasks)}
          createTask={(taskDetails) => ({
            id: crypto.randomUUID(),
            ...taskDetails,
          })}
        />
      </div>
    </>
  )
}
