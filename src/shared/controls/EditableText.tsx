import { Box, BoxProps, Input } from "@chakra-ui/react"
import { useEffect, useRef, useState } from "react"

interface Props extends Omit<BoxProps, "onChange"> {
  onChange: (text: string) => void
  label: string
  children: string
}

export function EditableText({ children, onChange, label, ...props }: Props) {
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
    <Input
      ref={inputRef}
      onBlur={handleSubmit}
      onKeyDown={(event) => {
        if (event.key === "Enter") {
          handleSubmit()
        }
      }}
      defaultValue={children}
      aria-label={label}
      border="none"
      fontSize="inherit"
      height="unset"
      {...props}
      paddingBlock="0"
    />
  ) : (
    <Box
      display="inline-block"
      {...props}
      tabIndex={0}
      onFocus={startEditing}
      onClick={startEditing}
    >
      {children}
    </Box>
  )
}
