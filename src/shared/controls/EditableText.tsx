import { CSSProperties, useEffect, useRef, useState } from "react"
import "./EditableText.css"

type Props = {
  onChange: (text: string) => void
  label: string
  style?: CSSProperties
  children: string
}

export function EditableText({ children, onChange, label, style }: Props) {
  const [isEditing, setIsEditing] = useState(false)
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
    const value = inputRef.current?.value ?? ""
    if (value !== children) {
      onChange(value)
    }

    stopEditing()
  }

  return isEditing ? (
    <input
      className="editable-text"
      ref={inputRef}
      onBlur={handleSubmit}
      onKeyDown={(event) => {
        if (event.key === "Enter") {
          handleSubmit()
        }
      }}
      defaultValue={children}
      aria-label={label}
      style={style}
    />
  ) : (
    <div
      tabIndex={0}
      onFocus={startEditing}
      onClick={startEditing}
      style={style}
    >
      {children}
    </div>
  )
}
