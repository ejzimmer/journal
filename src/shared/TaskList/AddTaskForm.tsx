import { Box, Flex, Field, Input, Textarea } from "@chakra-ui/react"
import { useRef, FormEvent, useEffect, useId, useState } from "react"
import { TaskButton } from "./TaskButton"
import { parse } from "date-fns"
import { Item, Label } from "./types"
import { Tag, TAG_COLOURS } from "../../tabs/Work/Tag"
import { Combobox } from "../controls/Combobox"

export function AddTaskForm({
  onSubmit,
  onCancel,
  labelOptions,
}: {
  onSubmit: (
    task: Omit<Partial<Item>, "labels"> & {
      labels?: Label[]
    }
  ) => void
  onCancel: (event?: React.MouseEvent) => void
  labelOptions: Label[]
}) {
  const formRef = useRef<HTMLFormElement>(null)
  const descriptionId = useId()
  const dueDateId = useId()
  const [labels, setLabels] = useState<Label[]>([])

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()

    const controls = formRef.current?.elements
    if (!controls) return

    // @ts-ignore
    const description = controls[descriptionId].value
    if (!description) return

    // @ts-ignore
    const dueDate = controls[dueDateId].value

    onSubmit({
      description,
      dueDate: dueDate
        ? parse(dueDate, "yyyy-MM-dd", new Date()).getTime()
        : undefined,
      labels,
    })

    formRef.current?.reset()
    setLabels([])
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
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            handleSubmit(event)
          }
        }}
      />
      <Field.Root
        id={dueDateId}
        invalid
        display="flex"
        alignItems="center"
        flexGrow="1"
        fontSize="0.8em"
        fontWeight="bold"
      >
        <Field.Label>Due date:</Field.Label>
        <Input
          type="date"
          width="auto"
          flexGrow={1}
          paddingInlineStart={0}
          border="0"
          _focusVisible={{ outline: "none" }}
        />
      </Field.Root>
      <Flex alignItems="center">
        <Field.Root
          display="flex"
          alignItems="center"
          flexGrow="1"
          fontSize="0.8em"
          fontWeight="bold"
          marginBlock="0"
        >
          <Field.Label>Labels</Field.Label>
          <Combobox
            value={labels}
            onChange={(labels) => setLabels(labels)}
            options={labels}
            renderButton={Tag}
          />
        </Field.Root>
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
      </Flex>
    </Box>
  )
}
