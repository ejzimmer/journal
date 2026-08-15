import "../App.css"
import { TopNav } from "../TopNav"
import { AppRoutes } from "../AppRoutes"

export function App() {
  return (
    <div className="main-content">
      <TopNav />
      <AppRoutes />
    </div>
  )
}
