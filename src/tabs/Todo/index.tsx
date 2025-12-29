import React, { createContext, useContext } from "react"
import { Category, ROOT_LIST, Task } from "./types"
import { TodayList } from "./Today/TodayList"
import { ThisWeekList } from "./ThisWeek/ThisWeekList"
import { DueDateList } from "./DueDate/DueDateList"

import "./index.css"
import { FirebaseContext } from "../../shared/FirebaseContext"

export const CategoriesContext = createContext<Category[] | undefined>(
  undefined
)

export function Todo() {
  const storageContext = useContext(FirebaseContext)
  if (!storageContext) {
    throw new Error("Missing Firebase context provider")
  }
  const { value: lists } = storageContext.useValue<Task[]>(ROOT_LIST)
  if (!lists) {
    return null
  }

  const tasks = Object.values(lists ?? {}).flatMap((list) =>
    Object.values(list)
  )

  // For the categories dropdown
  const categories = new Map<string, Category>()
  tasks.forEach((task) => {
    categories.set(task.category.text, task.category)
  })

  return (
    <CategoriesContext.Provider value={Array.from(categories.values())}>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "80px" }}>
        <TodayList />
        <ThisWeekList />
        <DueDateList />
      </div>
    </CategoriesContext.Provider>
  )
}
