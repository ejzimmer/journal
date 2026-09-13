import {
  CSSProperties,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react"
import "./EditableText.css"

export type EditableTextProps = {
  value: string
  onChange: (text: string) => void
  onDelete?: () => void
  label: string
  style?: CSSProperties
  className?: string
}

const measureStyle: CSSProperties = {
  position: "absolute",
  visibility: "hidden",
  height: 0,
  overflow: "hidden",
  whiteSpace: "pre",
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
  const [inputWidth, setInputWidth] = useState<number>()
  const inputRef = useRef<HTMLInputElement>(null)
  const measureRef = useRef<HTMLSpanElement>(null)

  const startEditing = () => {
    setIsEditing(true)
  }
  const stopEditing = () => setIsEditing(false)

  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus()
    }
  }, [isEditing, inputRef])

  useLayoutEffect(() => {
    if (!isEditing || !measureRef.current) return

    setInputWidth(measureRef.current.scrollWidth + 12)
  }, [isEditing, text])

  const handleSubmit = () => {
    if (value && !text && onDelete) {
      onDelete()
    } else if (value !== text) {
      onChange(text)
    }

    stopEditing()
  }

  return isEditing ? (
    <>
      <span
        ref={measureRef}
        aria-hidden="true"
        style={{ fontSize: ".8em", ...style, ...measureStyle }}
      >
        {text || " "}
      </span>
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
        value={text}
        aria-label={label}
        style={{ fontSize: ".8em", ...style, width: inputWidth }}
      />
    </>
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
