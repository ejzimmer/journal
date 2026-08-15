import "../App.css"
import { TopNav } from "../TopNav"
import { AppRoutes } from "../AppRoutes"

export function App() {
  return (
    <>
      <TopNav />
      <div className="main-content">
        <AppRoutes />
      </div>
    </>
  )
}
