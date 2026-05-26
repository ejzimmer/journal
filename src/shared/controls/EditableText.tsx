import { CSSProperties, useEffect, useRef, useState } from "react"
import "./EditableText.css"

export type EditableTextProps = {
  value: string
  onChange: (text: string) => void
  onDelete?: () => void
  label: string
  style?: CSSProperties
  className?: string
}

export function EditableText({
  value,
  onChange,
  onDelete,
  label,
  style,
  className = "",
}: EditableTextProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [text, setText] = useState(value)
  const inputRef = useRef<HTMLInputElement>(null)

  const startEditing = () => {
    setIsEditing(true)
  }
  const stopEditing = () => setIsEditing(false)

  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus()
    }
  }, [isEditing, inputRef])

  const handleSubmit = () => {
    if (value && !text && onDelete) {
      onDelete()
    } else if (value !== text) {
      onChange(text)
    }

    stopEditing()
  }

  return isEditing ? (
    <input
      className={`editable-text ${className}`}
      ref={inputRef}
      onBlur={handleSubmit}
      onKeyDown={(event) => {
        if (event.key === "Enter") {
          handleSubmit()
          event.preventDefault()
        } else if (event.key === "Escape") {
          setText(value)
          stopEditing()
        }
      }}
      onChange={(event) => setText(event.target.value)}
      size={text.length}
      value={text}
      aria-label={label}
      style={{ fontSize: ".8em", ...style }}
    />
  ) : (
    <div
      tabIndex={0}
      onFocus={startEditing}
      onClick={startEditing}
      style={style}
      className={className}
    >
      {value}
    </div>
  )
}
