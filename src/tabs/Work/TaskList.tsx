import { Box, Heading, Stack } from "@chakra-ui/react"
import { useState, MouseEvent, FocusEvent } from "react"
import { EditableText } from "../../shared/controls/EditableText"
import { AddTaskForm } from "../../shared/TaskList/AddTaskForm"
import { Item } from "../../shared/TaskList/types"
import { ItemDescription } from "../../shared/TaskList/ItemDescription"

export function TaskList({
  list,
  onUpdateListName,
  onAddTask,
}: {
  list: Item
  onUpdateListName: (name: string) => void
  onAddTask: (description: string) => void
}) {
  const [addTaskFormVisible, setAddTaskFormVisible] = useState(false)

  const showTaskForm = (event: MouseEvent | FocusEvent) => {
    event.stopPropagation()
    setAddTaskFormVisible(true)
  }

  return (
    <Box
      key={list.id}
      display="flex"
      flexDirection="column"
      minWidth="200px"
      minHeight="300px"
      cursor="text"
      onClick={showTaskForm}
      onFocus={showTaskForm}
    >
      <Heading as="h2" fontSize="20px">
        <EditableText
          label={`Edit ${list.description} name`}
          onChange={onUpdateListName}
        >
          {list.description}
        </EditableText>
      </Heading>
      <Box
        as="ul"
        flexGrow={1}
        lineHeight="1"
        listStyleType="none"
        sx={{
          "--line-colour": "hsl(200 90% 80%)",
          "--line-height": "32px",
        }}
        background="repeating-linear-gradient(white, white var(--line-height), var(--line-colour) var(--line-height), var(--line-colour) calc(var(--line-height) + 1px), white calc(var(--line-height) + 1px))"
      >
        {list.items &&
          Object.values(list.items).map((item) => (
            <li key={item.id}>
              <Task
                task={item}
                onChange={(task) => console.log("onChange", task)}
              />
            </li>
          ))}
      </Box>
      {addTaskFormVisible && (
        <AddTaskForm
          onSubmit={onAddTask}
          onCancel={() => setAddTaskFormVisible(false)}
        />
      )}
    </Box>
  )
}

function Task({
  task,
  onChange,
}: {
  task: Item
  onChange: (task: Item) => void
}) {
  return (
    <Box fontFamily="'Shadows Into Light', sans-serif" fontSize="24px">
      <ItemDescription
        description={task.description}
        onChange={(description) => onChange({ ...task, description })}
        isDone={task.isComplete}
      />
    </Box>
  )
}
