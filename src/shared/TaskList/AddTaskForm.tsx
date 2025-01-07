import {
  Box,
  FormControl,
  FormLabel,
  Grid,
  Input,
  Textarea,
} from "@chakra-ui/react"
import { useRef, FormEvent, useEffect, useId } from "react"
import { TaskButton } from "./TaskButton"
import { parse } from "date-fns"

export function AddTaskForm({
  onSubmit,
  onCancel,
}: {
  onSubmit: (description: string, dueDate?: Date) => void
  onCancel: (event?: React.MouseEvent) => void
}) {
  const formRef = useRef<HTMLFormElement>(null)
  const descriptionId = useId()
  const dueDateId = useId()

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()

    const controls = formRef.current?.elements
    if (!controls) return

    // @ts-ignore
    const description = controls[descriptionId].value
    if (!description) return

    // @ts-ignore
    const dueDate = controls[dueDateId].value

    onSubmit(
      description,
      dueDate ? parse(dueDate, "yyyy-MM-dd", new Date()) : undefined
    )
    formRef.current.reset()
  }

  useEffect(() => {
    const listener = (event: MouseEvent) => {
      if (!formRef.current) return

      if (
        event.target &&
        !formRef.current.contains(event.target as HTMLElement)
      ) {
        onCancel()
      }
    }

    window.addEventListener("click", listener)

    return () => window.removeEventListener("click", listener)
  }, [onCancel])

  return (
    <Box
      as="form"
      // @ts-ignore
      ref={formRef}
      outline="2px dashed"
      paddingBlock="4px"
      paddingInline="8px"
      onSubmit={handleSubmit}
      marginBlockStart="40px"
    >
      <Textarea
        aria-label="Task description"
        id={descriptionId}
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
        noOfLines={2}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            handleSubmit(event)
          }
        }}
      />
      <Grid display="flex" alignItems="center">
        <FormControl
          id={dueDateId}
          display="flex"
          alignItems="center"
          flexGrow="1"
        >
          <FormLabel fontSize="0.8em" fontWeight="bold" marginBlock="0">
            Due date:
          </FormLabel>
          <Input
            type="date"
            width="auto"
            flexGrow={1}
            paddingInlineStart={0}
            border="0"
            _focusVisible={{ outline: "none" }}
          />
        </FormControl>
        <TaskButton
          fontSize="1em"
          padding="2px"
          type="reset"
          onClick={onCancel}
        >
          ❌
        </TaskButton>
        <TaskButton padding="2px" fontSize="1em" type="submit">
          ✅
        </TaskButton>
      </Grid>
    </Box>
  )
}
