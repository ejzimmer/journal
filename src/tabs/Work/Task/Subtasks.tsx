import { useWorkStorage } from "../WorkStorageContext"
import { Subtask } from "../types"

type SubtasksProps = {
  subtasks?: Record<string, Subtask>
  listId: string
  taskId: string
}

export function Subtasks({ subtasks, listId, taskId }: SubtasksProps) {
  const { deleteSubtask } = useWorkStorage()

  if (!subtasks || Object.keys(subtasks).length === 0) {
    return null
  }

  const sorted = Object.values(subtasks).toSorted((a, b) =>
    a.id.localeCompare(b.id),
  )

  return (
    <span className="subtasks">
      [
      {sorted.map((subtask, index) => (
        <span key={subtask.id}>
          <button
            type="button"
            className="subtask"
            onClick={() => deleteSubtask(listId, taskId, subtask)}
          >
            {subtask.description}
          </button>
          {index < sorted.length - 1 ? ", " : ""}
        </span>
      ))}
      ]
    </span>
  )
}
