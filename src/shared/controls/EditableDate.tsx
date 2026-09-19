import { format, parse } from "date-fns"
import { useEffect, useRef, useState } from "react"

interface Props
  extends Omit<
    React.HTMLAttributes<HTMLDivElement>,
    "children" | "style" | "onChange"
  > {
  onChange: (date: number) => void
  value: number
}

export function EditableDate({ onChange, value, ...props }: Props) {
  const [editingValue, setEditingValue] = useState(
    format(new Date(value), "yyyy-MM-dd")
  )
  const [isEditing, setIsEditing] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const displayRef = useRef<HTMLDivElement>(null)
  const hasStartedEditing = useRef(false)
  const startEditing = () => {
    setIsEditing(true)
  }
  const stopEditing = () => setIsEditing(false)

  useEffect(() => {
    if (isEditing) {
      hasStartedEditing.current = true
      inputRef.current?.focus()
      return
    }

    if (hasStartedEditing.current) {
      displayRef.current?.focus()
    }
  }, [isEditing])

  const cancelEditing = () => {
    setEditingValue(format(new Date(value), "yyyy-MM-dd"))
    stopEditing()
  }

  const handleSubmit = () => {
    const inputValue = inputRef.current?.value ?? ""
    const date = parse(inputValue, "yyyy-MM-dd", new Date()).getTime()
    if (date !== value) {
      onChange(date)
    }

    stopEditing()
  }

  return isEditing ? (
    <input
      type="date"
      ref={inputRef}
      onBlur={handleSubmit}
      onKeyDown={(event) => {
        if (event.key === "Enter") {
          event.preventDefault()
          handleSubmit()
        }

        if (event.key === "Escape") {
          event.stopPropagation()
          cancelEditing()
        }
      }}
      value={editingValue}
      onChange={(event) => setEditingValue(event.target.value)}
      aria-label="Due date"
      {...props}
    />
  ) : (
    <div
      {...props}
      ref={displayRef}
      tabIndex={0}
      onClick={startEditing}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault()
          startEditing()
        }
      }}
    >
      {format(value, "dd MMM")}
    </div>
  )
}
