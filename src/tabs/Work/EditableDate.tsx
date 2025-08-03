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
          handleSubmit()
        }
      }}
      value={value}
      aria-label="Due date"
      style={{
        border: "none",
        fontSize: "inherit",
        height: "unset",
        paddingBlock: "0",
      }}
      {...props}
    />
  ) : (
    <div
      style={{
        fontSize: ".6em",
        fontFamily: "sans-serif",
        padding: "8px 4px",
      }}
      {...props}
      tabIndex={0}
      onFocus={startEditing}
      onClick={startEditing}
    >
      {format(value, "dd MMM")}
    </div>
  )
}
