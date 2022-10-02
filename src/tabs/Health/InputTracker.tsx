import { Input } from "@chakra-ui/react"

type Props = {
  value: string
  onChange: (value: string) => void
}

export function InputTracker({ value, onChange }: Props) {
  return (
    <Input
      value={value}
      onChange={(event) => onChange(event.target.value)}
      maxLength={4}
      width="3.5ch"
      variant="flushed"
      height="min-content"
      textAlign="center"
    />
  )
}
