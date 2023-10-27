import { Button, Checkbox } from "@chakra-ui/react"
import { EditableText } from "./EditableText"

// Add waiting status

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
  return (
    <label
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
        borderColor="gray.500"
        isChecked={isDone}
        onChange={(event) => onDoneChange(event.target.checked)}
      />
      <EditableText value={title} onChange={onTitleChange} />
      <Button aria-label={`Delete task: ${title}`} onClick={onDelete}>
        🗑️
      </Button>
    </label>
  )
}
