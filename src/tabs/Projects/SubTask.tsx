import { Button, Checkbox, Input, ListItem, useId } from "@chakra-ui/react"
import { useRef } from "react"

type Props = {
  title: string
  isDone: boolean
  onDoneChange: (done: boolean) => void
  onTitleChange: (title: string) => void
  onDelete: () => void
}

export function SubTask({
  title,
  isDone,
  onDoneChange,
  onTitleChange,
  onDelete,
}: Props) {
  const checkboxId = useId()

  return (
    <ListItem
      style={{
        display: "flex",
        alignItems: "center",
        gap: "1em",
        flexGrow: "1",
        paddingLeft: "1em",
        cursor: "pointer",
      }}
    >
      <Checkbox
        id={checkboxId}
        borderColor="gray.500"
        isChecked={isDone}
        onChange={(event) => onDoneChange(event.target.checked)}
      />
      <label
        style={{ width: 0, height: 0, overflow: "hidden" }}
        htmlFor={checkboxId}
      >
        {title}
      </label>
      <Input
        aria-label="Task description"
        defaultValue={title}
        onBlur={(event) => onTitleChange(event.target.value)}
      />
      <Button aria-label={`Delete task: ${title}`} onClick={onDelete}>
        🗑️
      </Button>
    </ListItem>
  )
}
