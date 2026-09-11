import { Routes, Route } from "react-router-dom"
import { Todo } from "./tabs/Todo"
import { TABS } from "./tabConfig"
import { useFlattenBookAuthors } from "./migrations/flattenBookAuthors"

export function AppRoutes() {
  useFlattenBookAuthors()

  return (
    <Routes>
      {TABS.map(({ path, Element }) => (
        <Route key={path} path={path} element={<Element />} />
      ))}
      <Route path="/" element={<Todo />} />
    </Routes>
  )
}
