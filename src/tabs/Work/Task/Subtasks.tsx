import { useContext } from "react"
import { FirebaseContext } from "../../../shared/FirebaseContext"
import { Subtask } from "../types"

type SubtasksProps = {
  subtasks?: Record<string, Subtask>
  path: string
}

export function Subtasks({ subtasks, path }: SubtasksProps) {
  const storageContext = useContext(FirebaseContext)
  if (!storageContext) {
    throw new Error("missing firebase context")
  }

  if (!subtasks || Object.keys(subtasks).length === 0) {
    return null
  }

  const sorted = Object.values(subtasks).toSorted(
    (a, b) => a.position - b.position,
  )

  return (
    <span className="subtasks">
      [
      {sorted.map((subtask, index) => (
        <span key={subtask.id}>
          <button
            type="button"
            className="subtask ghost"
            onClick={() => storageContext.deleteItem(path, subtask)}
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
