import { Box, Input } from "@chakra-ui/react"
import { useState } from "react"

type Props = {
  value?: string
  onChange: (value: string) => void
}

export function EditableText({ value, onChange }: Props) {
  const [isInEditMode, setInEditMode] = useState(false)

  const openEditMode = () => setInEditMode(true)
  const closeEditMode = () => setInEditMode(false)

  return isInEditMode ? (
    <form onSubmit={closeEditMode}>
      <Input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onBlur={closeEditMode}
      />
    </form>
  ) : (
    <Box onClick={openEditMode}>{value}</Box>
  )
}
