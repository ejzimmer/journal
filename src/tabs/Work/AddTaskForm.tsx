import { useEffect, useRef } from "react"
import { TickIcon } from "../../shared/icons/Tick"
import { XIcon } from "../../shared/icons/X"

type NewTask = {
  description: string
  dueDate?: number
}

type AddTaskFormProps = {
  onSubmit: (task: NewTask) => void
  onClose: () => void
}

export function AddTaskForm({ onSubmit, onClose }: AddTaskFormProps) {
  const descriptionRef = useRef<HTMLInputElement>(null)
  const dateRef = useRef<HTMLInputElement>(null)

  const handleCancel = (event: React.KeyboardEvent) => {
    if (event.key === "Escape") {
      onClose()
    }
  }

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    const description = descriptionRef.current?.value

    if (description) {
      const dateValue = dateRef.current?.value
      const dueDate = dateValue ? new Date(dateValue).getTime() : undefined
      onSubmit({ description, dueDate })
      onClose()
    }
  }

  useEffect(() => {
    if (descriptionRef.current) {
      descriptionRef.current.focus()
    }
  }, [])

  return (
    <form
      onSubmit={handleSubmit}
      onKeyDown={handleCancel}
      className="add-task"
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "12px",
        fontSize: "1.5rem",
        paddingInline: "4px",
      }}
    >
      <input
        aria-label="Description"
        ref={descriptionRef}
        className="inline"
        style={{
          fontSize: "1.4rem",
          marginBlockStart: "6px",
        }}
      />
      <input
        type="date"
        aria-label="Due date"
        ref={dateRef}
        className="inline"
        style={{ color: "var(--body-colour-mid)", marginBlockStart: "-4px" }}
      />
      <div style={{ display: "flex", justifyContent: "end", gap: "4px" }}>
        <button
          className="icon outline"
          style={{ color: "var(--success-colour)" }}
        >
          <TickIcon />
        </button>
        <button
          className="icon outline"
          style={{ color: "var(--danger-colour-dark)" }}
          onClick={onClose}
        >
          <XIcon />
        </button>
      </div>
    </form>
  )
}
