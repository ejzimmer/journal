import { useEffect, useRef, useState } from "react"
import { TickIcon } from "../../shared/icons/Tick"
import { XIcon } from "../../shared/icons/X"
import { DueDate } from "./Task/DueDate"
import { UpdateLabels } from "./Task/UpdateLabels"
import { Label } from "./types"

type NewTask = {
  description: string
  dueDate?: number
  labels: Label[]
}

type AddTaskFormProps = {
  onSubmit: (task: NewTask) => void
  onClose: () => void
}

export function AddTaskForm({ onSubmit, onClose }: AddTaskFormProps) {
  const descriptionRef = useRef<HTMLInputElement>(null)
  const [dueDate, setDueDate] = useState<number>()
  const [labels, setLabels] = useState<Label[]>([])

  const handleCancel = (event: React.KeyboardEvent) => {
    if (event.key === "Escape") {
      onClose()
    }
  }

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    const description = descriptionRef.current?.value
    if (!description) {
      return
    }

    const task: NewTask = {
      description,
      labels,
    }

    if (dueDate) {
      task.dueDate = dueDate
    }

    onSubmit(task)
    onClose()
  }

  const addLabel = (label: Label) =>
    setLabels((current) =>
      current.some(({ value }) => value === label.value)
        ? current
        : [...current, label],
    )

  const removeLabel = (value: string) =>
    setLabels((current) => current.filter((label) => label.value !== value))

  useEffect(() => {
    descriptionRef.current?.focus()
  }, [])

  return (
    <form
      onSubmit={handleSubmit}
      onKeyDown={handleCancel}
      className="add-task"
    >
      <input
        aria-label="Description"
        ref={descriptionRef}
        className="description"
      />
      {labels.length > 0 && (
        <ul className="labels">
          {labels.map((label) => (
            <li key={label.value} className={`label-tag ${label.colour}`}>
              {label.value}
              <button
                type="button"
                className="ghost transient"
                aria-label={`Remove ${label.value}`}
                onClick={() => removeLabel(label.value)}
              >
                <XIcon width="16px" />
              </button>
            </li>
          ))}
        </ul>
      )}
      <DueDate dueDate={dueDate} onChange={setDueDate} />
      <UpdateLabels onAddLabel={addLabel} />
      <button
        aria-label="submit"
        className="icon outline"
        style={{ color: "var(--success-colour)" }}
      >
        <TickIcon />
      </button>
      <button
        type="button"
        aria-label="cancel"
        className="icon outline"
        style={{ color: "var(--danger-colour-dark)" }}
        onClick={onClose}
      >
        <XIcon />
      </button>
    </form>
  )
}
