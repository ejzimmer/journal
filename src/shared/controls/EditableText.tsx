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

function measureTextWidth(
  canvas: HTMLCanvasElement,
  font: string,
  text: string,
) {
  const context = canvas.getContext("2d")
  if (!context) return undefined

  context.font = font
  return context.measureText(text || " ").width
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
  const measureCanvasRef = useRef<HTMLCanvasElement>(null)

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
    if (!isEditing || !inputRef.current) return

    if (!measureCanvasRef.current) {
      measureCanvasRef.current = document.createElement("canvas")
    }

    const font = getComputedStyle(inputRef.current).font
    const textWidth = measureTextWidth(measureCanvasRef.current, font, text)
    if (textWidth !== undefined) {
      setInputWidth(textWidth + 12)
    }
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
