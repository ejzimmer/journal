import { ItemProvider } from "../../shared/storage/ItemManager"
import { MockStoreProvider } from "../../shared/storage/Store"
import { TaskList } from "../../shared/TaskList"

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
    <MockStoreProvider initialItems={TASKS}>
      <ItemProvider>
        <TaskList taskIds={taskList} />
      </ItemProvider>
    </MockStoreProvider>
  )
}
