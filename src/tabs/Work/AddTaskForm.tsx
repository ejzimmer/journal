import { useEffect, useRef, useState } from "react"
import { TickIcon } from "../../shared/icons/Tick"
import { XIcon } from "../../shared/icons/X"
import { LabelsControl } from "./LabelsControl"
import { Label } from "../../shared/TaskList/types"

type NewTask = {
  description: string
  dueDate?: number
  labels: Label[]
}

type AddTaskFormProps = {
  onSubmit: (task: NewTask) => void
  onClose: () => void
  existingLabels: Label[]
}

export function AddTaskForm({
  onSubmit,
  onClose,
  existingLabels,
}: AddTaskFormProps) {
  const formRef = useRef<HTMLFormElement>(null)
  const descriptionRef = useRef<HTMLInputElement>(null)
  const dateRef = useRef<HTMLInputElement>(null)
  const [labels, setLabels] = useState<Label[]>([])

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
      onSubmit({ description, dueDate, labels })
      onClose()
    }
  }

  useEffect(() => {
    if (descriptionRef.current) {
      descriptionRef.current.focus()
    }
  }, [])

  useEffect(() => {
    if (!descriptionRef.current || !dateRef.current) return

    const description = descriptionRef.current
    const date = dateRef.current
    const handleBlur = () => {
      requestAnimationFrame(() => {
        if (
          !formRef.current?.contains(document.activeElement) &&
          !descriptionRef.current?.value
        ) {
          onClose()
        }
      })
    }

    description.addEventListener("blur", handleBlur)
    date.addEventListener("blur", handleBlur)

    return () => {
      description.removeEventListener("blur", handleBlur)
      date.removeEventListener("blur", handleBlur)
    }
  }, [formRef, onClose])

  return (
    <form
      ref={formRef}
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
      <LabelsControl
        value={labels}
        onChange={(labels) => {
          console.log("updating labels", labels)
          setLabels(labels)
        }}
        options={existingLabels}
        label="Labels"
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
