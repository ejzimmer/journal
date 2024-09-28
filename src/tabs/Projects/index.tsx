import { Task } from "../../shared/TaskList/Task"
import { FetchItem, UpdateItem } from "../../shared/storage/Context"

const TASKS = {
  "1": {
    id: "1",
    description: "Make shirt",
    isComplete: false,
    items: ["11", "12", "13"],
  },
  "11": { id: "11", description: "Buy fabric", isComplete: false },
  "12": { id: "12", description: "Prewash fabric", isComplete: false },
  "13": { id: "13", description: "Cut pattern", isComplete: false },
}

const taskList = ["1"]

export function Projects() {
  return (
    <UpdateItem.Provider value={(onchange, onDelete, onAddTask)}>
      <FetchItem.Provider value={(id) => undefined}>
        {taskList.map()}
      </FetchItem.Provider>
    </UpdateItem.Provider>
  )
}
