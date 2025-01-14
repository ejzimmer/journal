import {
  Box,
  Flex,
  FormControl,
  FormLabel,
  Input,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Textarea,
} from "@chakra-ui/react"
import { useRef, FormEvent, useEffect, useId, useState } from "react"
import { TaskButton } from "./TaskButton"
import { parse } from "date-fns"
import { Item, Label } from "./types"
import { Tag, TAG_COLOURS } from "../../tabs/Work/Tag"

export function AddTaskForm({
  onSubmit,
  onCancel,
  labels,
}: {
  onSubmit: (
    task: Omit<Partial<Item>, "labels"> & {
      labels?: Label[]
    }
  ) => void
  onCancel: (event?: React.MouseEvent) => void
  labels: Label[]
}) {
  const formRef = useRef<HTMLFormElement>(null)
  const descriptionId = useId()
  const dueDateId = useId()
  const labelsRef = useRef<Label[]>()

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
      labels: labelsRef.current,
    })

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
      <Flex alignItems="center">
        <FormControl display="flex" alignItems="center" flexGrow="1">
          <FormLabel fontSize="0.8em" fontWeight="bold" marginBlock="0">
            Labels
          </FormLabel>
          <Combobox
            onSubmit={(labels) => (labelsRef.current = labels)}
            options={labels}
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
      </Flex>
    </Box>
  )
}

// make list of labels look nice
// choose labels from the list of existing labels
// add new labels to existing task
// make labels on different tasks different colours
// edit labels
// Migrate lists to /work/tasks and keep labels at /work/labels
// split up this file and move it into work/

function Combobox({
  onSubmit,
  options,
}: {
  onSubmit: (labels: Label[]) => void
  options: Label[]
}) {
  return (
    <Popover autoFocus={false} placement="bottom-start">
      <PopoverTrigger>
        <Box width="100%">
          <TagsInput onSubmit={onSubmit} />
        </Box>
      </PopoverTrigger>
      <PopoverContent>
        <ul>
          {options.map(({ text, colour }) => (
            <li key={text}>
              <Tag text={text} colour={colour} />
            </li>
          ))}
        </ul>
      </PopoverContent>
    </Popover>
  )
}

type TagsInputProps = {
  initialValue?: Label[]
  onSubmit: (labels: Label[]) => void
}

function TagsInput({ initialValue, onSubmit }: TagsInputProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [inputPadding, setInputPadding] = useState(0)
  const [inputValue, setInputValue] = useState("")
  const [labels, setLabels] = useState<Label[]>(initialValue ?? [])

  useEffect(() => {
    if (!containerRef.current) return

    const containerWidth = containerRef.current.clientWidth
    setInputPadding(containerWidth)
  }, [labels])

  const handleDeleteLabel = (label: Label) => {
    setLabels(
      labels.filter((v) => v.text !== label.text && v.colour !== label.colour)
    )
  }

  return (
    <Flex position="relative" flexGrow={1}>
      <Flex
        ref={containerRef}
        gap="2px"
        position="absolute"
        insetBlock="4px"
        insetInline="4px"
        width="fit-content"
      >
        {labels.map(({ text, colour }) => (
          <Tag
            key={text}
            text={text}
            colour={colour}
            onDelete={() => handleDeleteLabel({ text, colour })}
          />
        ))}
      </Flex>
      <Input
        paddingInlineStart={`${inputPadding + 4}px`}
        flexGrow={1}
        value={inputValue}
        onChange={(event) => setInputValue(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter" && event.currentTarget.value) {
            event.stopPropagation()
            event.preventDefault()

            const newValue: Label = {
              text: event.currentTarget.value,
              colour: TAG_COLOURS[labels.length % TAG_COLOURS.length],
            }
            setLabels([...labels, newValue])
            setInputValue("")

            return
          }

          if (event.key === "Enter" && labels.length) {
            onSubmit(labels)
            setLabels([])
          }

          if (event.key === "Backspace" && !event.currentTarget.value) {
            setLabels(labels.slice(0, labels.length - 1))
          }
        }}
      />
    </Flex>
  )
}
