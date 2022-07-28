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
      maxLength={2}
      width="2ch"
      variant="flushed"
      height="min-content"
      textAlign="right"
    />
  )
}
