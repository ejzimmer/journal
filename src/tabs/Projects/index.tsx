import { Task } from "../../shared/TaskList/Task"
import { ItemProvider } from "../../shared/storage/Context"

export function Projects() {
  return (
    <ItemProvider itemId="1">
      <Task />
    </ItemProvider>
  )
}
