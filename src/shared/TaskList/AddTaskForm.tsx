import { Button, Box, Textarea } from "@chakra-ui/react"
import { useRef, FormEvent, useEffect } from "react"
import { TaskButton } from "./TaskButton"

export function AddTaskForm({
  onSubmit,
  onCancel,
}: {
  onSubmit: (description: string) => void
  onCancel: (event?: React.MouseEvent) => void
}) {
  const inputRef = useRef<HTMLTextAreaElement>(null)

  const addSubtask = (event: FormEvent) => {
    event.preventDefault()
    const description = inputRef.current?.value
    if (!inputRef.current || !description) return

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
  }, [onCancel])

  return (
    <Box as="form" onSubmit={addSubtask} position="relative">
      <Textarea
        ref={inputRef}
        aria-label="Task description"
        border="none"
        borderRadius="0"
        paddingInlineStart="0"
        paddingInlineEnd="40px"
        paddingBlockStart="0"
        _focusVisible={{
          outline: "none",
        }}
        fontFamily="inherit"
        fontSize="inherit"
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            addSubtask(event)
          }
        }}
      />
      <Box
        position="absolute"
        insetBlockStart="0"
        insetInlineEnd="0"
        display="flex"
      >
        <TaskButton
          size="fit-content"
          padding="2px"
          type="reset"
          onClick={onCancel}
        >
          ❌
        </TaskButton>
        <TaskButton size="fit-content" padding="2px" type="submit">
          ✅
        </TaskButton>
      </Box>
    </Box>
  )
}
