import { Button, Input } from "@chakra-ui/react"
import { FormEvent, useEffect, useRef } from "react"

type Props = {
  onSubmit: (name: string) => void
  onCancel: () => void
}

export function NewTaskForm({ onSubmit, onCancel }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const formRef = useRef<HTMLFormElement>(null)

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    const name = inputRef.current?.value ?? ""
    onSubmit(name)
  }

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (
        event.target instanceof Node &&
        !formRef.current?.contains(event.target)
      ) {
        onCancel()
      }
    }

    window.addEventListener("click", handleClick)

    return () => window.removeEventListener("click", handleClick)
  }, [onCancel])

  return (
    <form onSubmit={handleSubmit} ref={formRef}>
      <Input ref={inputRef} />
      <Button type="submit" aria-label="Add">
        tick
      </Button>
      <Button aria-label="Cancel" onClick={onCancel}>
        cross
      </Button>
    </form>
  )
}
