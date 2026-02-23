import { CSSProperties, useEffect, useRef, useState } from "react"
import "./EditableText.css"

type Props = {
  onChange: (text: string) => void
  label: string
  style?: CSSProperties
  className?: string
  children: string
  size?: number
}

export function EditableText({
  children,
  onChange,
  label,
  style,
  className = "",
  size,
}: Props) {
  const [isEditing, setIsEditing] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const outputRef = useRef<HTMLDivElement>(null)
  const widthRef = useRef<number>(undefined)

  const startEditing = () => {
    setIsEditing(true)
  }
  const stopEditing = () => setIsEditing(false)

  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus()
    }
  }, [isEditing, inputRef])

  useEffect(() => {
    if (outputRef.current) {
      widthRef.current = outputRef.current.clientWidth + 8
    }
  }, [children])

  const handleSubmit = () => {
    const value = inputRef.current?.value ?? ""
    if (value !== children) {
      onChange(value)
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
        }
      }}
      size={size}
      defaultValue={children}
      aria-label={label}
      style={{ fontSize: ".8em", width: `${widthRef.current}px`, ...style }}
    />
  ) : (
    <div
      tabIndex={0}
      onFocus={startEditing}
      onClick={startEditing}
      style={style}
      className={className}
      ref={outputRef}
    >
      {children}
    </div>
  )
}
