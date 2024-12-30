import { Box, Checkbox, Heading } from "@chakra-ui/react"
import { useState, MouseEvent, FocusEvent, useRef } from "react"
import { EditableText } from "../../shared/controls/EditableText"
import { AddTaskForm } from "../../shared/TaskList/AddTaskForm"
import { Item } from "../../shared/TaskList/types"
import { ItemDescription } from "../../shared/TaskList/ItemDescription"
import { chakra } from "@chakra-ui/react"

export function TaskList({
  list,
  onChangeListName,
  onAddTask,
  onChangeTask,
}: {
  list: Item
  onChangeListName: (name: string) => void
  onAddTask: (description: string) => void
  onChangeTask: (task: Item) => void
}) {
  const listRef = useRef<HTMLUListElement>(null)
  const [addTaskFormVisible, setAddTaskFormVisible] = useState(false)

  const showTaskForm = (event: MouseEvent | FocusEvent) => {
    event.stopPropagation()
    if (event.target === listRef.current) {
      setAddTaskFormVisible(true)
    }
  }

  return (
    <Box
      display="flex"
      flexDirection="column"
      minWidth="300px"
      minHeight="300px"
      cursor="text"
    >
      <Heading as="h2" fontSize="20px">
        <EditableText
          label={`Edit ${list.description} name`}
          onChange={onChangeListName}
        >
          {list.description}
        </EditableText>
      </Heading>
      <chakra.ul
        ref={listRef}
        onClick={showTaskForm}
        onFocus={showTaskForm}
        flexGrow={1}
        lineHeight="1"
        listStyleType="none"
        sx={{
          "--line-colour": "hsl(200 90% 80%)",
          "--line-height": "32px",
        }}
        fontFamily="'Shadows Into Light', sans-serif"
        fontSize="24px"
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
        {addTaskFormVisible && (
          <li>
            <AddTaskForm
              onSubmit={onAddTask}
              onCancel={(event) => {
                setAddTaskFormVisible(false)
              }}
            />
          </li>
        )}
      </chakra.ul>
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
    <Box>
      <ItemDescription
        description={task.description}
        onChange={(description) => onChange({ ...task, description })}
        isDone={task.isComplete}
      />
    </Box>
  )
}
