import { createContext } from "react"
import { TODO_KEY, TodoTask } from "../../shared/types"
import { TodayList } from "./Today/TodayList"
import { ThisWeekList } from "./ThisWeek/ThisWeekList"
import { DueDateList } from "./DueDate/DueDateList"

import "./index.css"
import { useStorageContext } from "../../shared/FirebaseContext"

export const CategoriesContext = createContext<string[] | undefined>(undefined)

export function Todo() {
  const { useValue } = useStorageContext()
  const { value: lists } = useValue<Record<string, TodoTask[]>>(TODO_KEY)
  if (!lists) {
    return null
  }

  const tasks = Object.values(lists).flatMap((list) => Object.values(list))
  const categories = new Set(tasks.map((task) => task.category))

  return (
    <CategoriesContext.Provider value={Array.from(categories)}>
      <div className="today">
        <div style={{ gridArea: "today" }}>
          <TodayList />
        </div>
        <div style={{ gridArea: "week", marginInlineEnd: "30px" }}>
          <ThisWeekList />
        </div>
        <div style={{ gridArea: "dates" }}>
          <DueDateList />
        </div>
      </div>
    </CategoriesContext.Provider>
  )
}
