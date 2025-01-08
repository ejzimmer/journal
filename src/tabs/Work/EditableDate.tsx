import { Badge, BoxProps, Input } from "@chakra-ui/react"
import { format, parse } from "date-fns"
import { useEffect, useRef, useState } from "react"

interface Props extends Omit<BoxProps, "onChange" | "children"> {
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
    <Input
      type="date"
      ref={inputRef}
      onBlur={handleSubmit}
      onKeyDown={(event) => {
        if (event.key === "Enter") {
          handleSubmit()
        }
      }}
      defaultValue={value}
      aria-label="Due date"
      border="none"
      fontSize="inherit"
      height="unset"
      {...props}
      paddingBlock="0"
    />
  ) : (
    <Badge
      fontSize=".6em"
      fontFamily="sans-serif"
      padding="8px 4px"
      variant="outline"
      colorScheme="red"
      {...props}
      tabIndex={0}
      onFocus={startEditing}
      onClick={startEditing}
    >
      {format(value, "dd MMM")}
    </Badge>
  )
}
