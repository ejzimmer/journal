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

    formRef.current.reset()
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
            value={labels}
            onChange={(labels) => setLabels(labels)}
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

// change it all to use html popover because popper is a pain
// submit labels & reset input when submitting from button
// choose labels from the list of existing labels
// remove chosen labels from list of available
// filter list of available by typing
// add new labels to existing task
// make labels on different tasks different colours
// edit labels
// Migrate lists to /work/tasks and keep labels at /work/labels
// split up this file and move it into work/

function Combobox({
  value,
  onChange,
  options,
}: {
  value: Label[]
  onChange: (labels: Label[]) => void
  options: Label[]
}) {
  const popoverRef = useRef<HTMLDivElement>(null)
  const onAddLabel = (label: Label) => onChange([...value, label])

  return (
    <>
      <Box width="100%" onClick={() => popoverRef.current?.togglePopover()}>
        <TagsInput
          labels={value}
          onAddLabel={onAddLabel}
          onDeleteLabel={(label) =>
            onChange(
              value.filter(
                (v) => v.text !== label.text && v.colour !== label.colour
              )
            )
          }
        />
      </Box>
      <div ref={popoverRef} popover="true">
        Popover content
      </div>
    </>
  )

  // return (
  //   <Popover autoFocus={false} placement="bottom-start">
  //     <PopoverTrigger></PopoverTrigger>
  //     <PopoverContent>
  //       <Box as="ul" padding="4px" listStyleType="none">
  //         {options.map(({ text, colour }) => (
  //           <Box as="li" key={text} margin="2px" width="100%">
  //             <Tag
  //               text={text}
  //               colour={colour}
  //               onClick={() => onAddLabel({ text, colour })}
  //             />
  //           </Box>
  //         ))}
  //       </Box>
  //     </PopoverContent>
  //   </Popover>
  // )
}

type TagsInputProps = {
  labels: Label[]
  onAddLabel: (label: Label) => void
  onDeleteLabel: (label: Label) => void
}

function TagsInput({ labels, onAddLabel, onDeleteLabel }: TagsInputProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [inputPadding, setInputPadding] = useState(0)
  const [inputValue, setInputValue] = useState("")

  useEffect(() => {
    if (!containerRef.current) return

    const containerWidth = containerRef.current.clientWidth
    setInputPadding(containerWidth)
  }, [labels])

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
            onDelete={() => onDeleteLabel({ text, colour })}
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
            onAddLabel(newValue)
            setInputValue("")

            return
          }

          if (event.key === "Backspace" && !event.currentTarget.value) {
            const lastLabel = labels.at(-1)
            if (lastLabel) {
              onDeleteLabel(lastLabel)
            }
          }
        }}
      />
    </Flex>
  )
}
