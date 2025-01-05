import { Box, Checkbox } from "@chakra-ui/react"
import { ItemDescription } from "../../shared/TaskList/ItemDescription"
import { Item } from "../../shared/TaskList/types"
import { EditableDate } from "./EditableDate"

export function Task({
  task,
  onChange,
  menu: Menu,
}: {
  task: Item
  onChange: (task: Item) => void
  menu?: React.FC
}) {
  return (
    <Box
      display="flex"
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
      <Box flexGrow="1">
        <ItemDescription
          description={task.description}
          onChange={(description) => onChange({ ...task, description })}
          isDone={task.isComplete}
        />
        {task.dueDate && (
          <EditableDate
            value={task.dueDate}
            onChange={(date) => {
              const { dueDate, ...taskWithoutDueDate } = task
              if (date) {
                onChange({ ...task, dueDate: date })
              } else {
                onChange(taskWithoutDueDate)
              }
            }}
          />
        )}
      </Box>
      {Menu && <Menu />}
    </Box>
  )
}
