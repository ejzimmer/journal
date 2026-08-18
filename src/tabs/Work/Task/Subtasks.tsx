import { FocusEvent, FormEvent, KeyboardEvent, useRef, useState } from "react"
import { useWorkStorage } from "../WorkStorageContext"
import { Subtask } from "../types"

type SubtasksProps = {
  subtasks?: Record<string, Subtask>
  listId: string
  taskId: string
}

export function Subtasks({ subtasks, listId, taskId }: SubtasksProps) {
  const { deleteSubtask, setSubtasks } = useWorkStorage()
  const [insertingAt, setInsertingAt] = useState<number | null>(null)
  const formRef = useRef<HTMLFormElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  if (!subtasks || Object.keys(subtasks).length === 0) {
    return null
  }

  const sorted = Object.values(subtasks).toSorted(
    (a, b) => a.position - b.position,
  )

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    const description = inputRef.current?.value.trim()
    if (description && insertingAt !== null) {
      const withInserted = [
        ...sorted.slice(0, insertingAt),
        { id: crypto.randomUUID(), description },
        ...sorted.slice(insertingAt),
      ].map((subtask, index) => ({ ...subtask, position: index }))
      setSubtasks(listId, taskId, withInserted)
    }
    setInsertingAt(null)
  }

  const handleBlur = (event: FocusEvent) => {
    const nextFocused = event.relatedTarget as Node | null
    const movedOutsideForm = !formRef.current?.contains(nextFocused)
    if (movedOutsideForm && !inputRef.current?.value) {
      setInsertingAt(null)
    }
  }

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === "Escape") {
      setInsertingAt(null)
    }
  }

  const insertForm = (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      onBlur={handleBlur}
      className="insert-subtask"
    >
      <input
        ref={inputRef}
        autoFocus
        aria-label="Insert subtask"
        className="inline"
        onKeyDown={handleKeyDown}
      />
    </form>
  )

  return (
    <span className="subtasks">
      {insertingAt === 0 ? (
        insertForm
      ) : (
        <button
          type="button"
          className="subtask-gap"
          aria-label="Insert subtask at start"
          onClick={() => setInsertingAt(0)}
        >
          [
        </button>
      )}
      {sorted.map((subtask, index) => (
        <span key={subtask.id}>
          <button
            type="button"
            className="subtask"
            onClick={() => deleteSubtask(listId, taskId, subtask)}
          >
            {subtask.description}
          </button>
          {index < sorted.length - 1 &&
            (insertingAt === index + 1 ? (
              insertForm
            ) : (
              <button
                type="button"
                className="subtask-gap"
                aria-label="Insert subtask here"
                onClick={() => setInsertingAt(index + 1)}
              >
                ,{" "}
              </button>
            ))}
        </span>
      ))}
      {insertingAt === sorted.length ? (
        insertForm
      ) : (
        <button
          type="button"
          className="subtask-gap"
          aria-label="Insert subtask at end"
          onClick={() => setInsertingAt(sorted.length)}
        >
          ]
        </button>
      )}
    </span>
  )
}
