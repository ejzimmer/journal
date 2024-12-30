import { Box, Checkbox } from "@chakra-ui/react"
import { DeleteTaskButton } from "../../shared/TaskList/DeleteTaskButton"
import { ItemDescription } from "../../shared/TaskList/ItemDescription"
import { Item } from "../../shared/TaskList/types"

export function Task({
  task,
  onChange,
  onDelete,
}: {
  task: Item
  onChange: (task: Item) => void
  onDelete: () => void
}) {
  return (
    <Box
      display="grid"
      gridTemplateColumns="min-content 1fr min-content"
      alignItems="baseline"
      opacity={task.isComplete ? 0.4 : 1}
    >
      <Checkbox
        aria-label={`${task.description}`}
        isChecked={task.isComplete}
        onChange={() => {
          const isComplete = !task.isComplete
          onChange({ ...task, isComplete })
        }}
        colorScheme="gray"
      />
      <ItemDescription
        description={task.description}
        onChange={(description) => onChange({ ...task, description })}
        isDone={task.isComplete}
      />
      <DeleteTaskButton
        taskDescription={task.description}
        onDelete={onDelete}
      />
    </Box>
  )
}
