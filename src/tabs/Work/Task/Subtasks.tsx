import { FocusEvent, FormEvent, KeyboardEvent, useRef, useState } from "react"
import { sortByPosition } from "../../../shared/drag-and-drop/utils"
import { useWorkStorage } from "../WorkStorageContext"
import { Subtask } from "../types"

type SubtasksProps = {
  subtasks?: Record<string, Subtask>
  listId: string
  taskId: string
}

export function Subtasks({ subtasks, listId, taskId }: SubtasksProps) {
  const { deleteSubtask, setSubtasks } = useWorkStorage()
  const [isEditing, setIsEditing] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const finishedRef = useRef(false)

  if (!subtasks || Object.keys(subtasks).length === 0) {
    return null
  }

  const sorted = sortByPosition(Object.values(subtasks))

  const save = () => {
    const text = inputRef.current?.value ?? ""
    const descriptions = text
      .split(",")
      .map((description) => description.trim())
      .filter(Boolean)

    const claimed = new Set<string>()
    const newSubtasks = descriptions.map((description, index) => {
      const existing = sorted.find(
        (subtask) =>
          subtask.description === description && !claimed.has(subtask.id),
      )
      if (existing) claimed.add(existing.id)
      return {
        id: existing?.id ?? crypto.randomUUID(),
        description,
        position: index,
      }
    })
    setSubtasks(listId, taskId, newSubtasks)
  }

  const finish = (shouldSave: boolean) => {
    finishedRef.current = true
    if (shouldSave) save()
    setIsEditing(false)
  }

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    finish(true)
  }

  const handleBlur = (event: FocusEvent) => {
    if (finishedRef.current) {
      finishedRef.current = false
      return
    }
    if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
      finish(true)
    }
  }

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === "Escape") {
      finish(false)
    }
  }

  if (isEditing) {
    return (
      <form className="subtasks editing" onSubmit={handleSubmit} onBlur={handleBlur}>
        <input
          ref={inputRef}
          autoFocus
          aria-label="Edit subtasks"
          className="inline"
          defaultValue={sorted.map((subtask) => subtask.description).join(", ")}
          onKeyDown={handleKeyDown}
        />
      </form>
    )
  }

  return (
    <span className="subtasks" onClick={() => setIsEditing(true)}>
      [
      {sorted.map((subtask, index) => (
        <span key={subtask.id}>
          <button
            type="button"
            className="subtask"
            onClick={(event) => {
              event.stopPropagation()
              deleteSubtask(listId, taskId, subtask)
            }}
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
