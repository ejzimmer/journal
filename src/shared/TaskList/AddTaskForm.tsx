import { Input, Button } from "@chakra-ui/react"
import { useRef, FormEvent, useEffect } from "react"

export function AddTaskForm({
  onSubmit,
  onCancel,
}: {
  onSubmit: (description: string) => void
  onCancel: () => void
}) {
  const inputRef = useRef<HTMLInputElement>(null)

  const addSubtask = (event: FormEvent) => {
    event.preventDefault()
    const description = inputRef.current?.value
    if (!inputRef.current ?? !description) return

    onSubmit(description)
    inputRef.current.value = ""
  }

  useEffect(() => {
    const listener = (event: MouseEvent) => {
      if (!inputRef.current) return

      if (
        event.target &&
        !inputRef.current.parentElement?.contains(event.target as HTMLElement)
      ) {
        onCancel()
      }
    }

    window.addEventListener("click", listener)

    return () => window.removeEventListener("click", listener)
  })

  return (
    <form onSubmit={addSubtask}>
      <Input ref={inputRef} aria-label="Task description" />
      <Button type="submit">Add</Button>
      <Button type="reset" onClick={onCancel}>
        Cancel
      </Button>
    </form>
  )
}
