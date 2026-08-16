import { FormEvent, KeyboardEvent, useContext, useRef, useState } from "react"
import { PlusIcon } from "../../../shared/icons/Plus"
import { FirebaseContext } from "../../../shared/FirebaseContext"
import { Subtask } from "../types"

type AddSubtaskProps = {
  subtasks?: Record<string, Subtask>
  path: string
  onToggle?: (adding: boolean) => void
}

export function AddSubtask({ subtasks, path, onToggle }: AddSubtaskProps) {
  const [adding, setAdding] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const storageContext = useContext(FirebaseContext)
  if (!storageContext) {
    throw new Error("missing firebase context")
  }

  const updateAdding = (value: boolean) => {
    setAdding(value)
    onToggle?.(value)
  }

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    const description = inputRef.current?.value.trim()
    if (description) {
      const position = Object.keys(subtasks ?? {}).length
      storageContext.addItem(path, { description, position })
    }
    updateAdding(false)
  }

  const handleBlur = () => {
    requestAnimationFrame(() => {
      if (!inputRef.current?.value) {
        updateAdding(false)
      }
    })
  }

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === "Escape") {
      updateAdding(false)
    }
  }

  if (!adding) {
    return (
      <button
        type="button"
        className="add-metadata ghost"
        aria-label="Add subtask"
        onClick={() => updateAdding(true)}
      >
        <PlusIcon width="16px" />
      </button>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="add-subtask">
      <input
        ref={inputRef}
        autoFocus
        aria-label="New subtask"
        className="inline"
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
      />
    </form>
  )
}
