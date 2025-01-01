import { Box, Heading } from "@chakra-ui/react"
import { useState, MouseEvent, FocusEvent, useRef } from "react"
import { EditableText } from "../../shared/controls/EditableText"
import { AddTaskForm } from "../../shared/TaskList/AddTaskForm"
import { Item } from "../../shared/TaskList/types"
import { chakra } from "@chakra-ui/react"
import { Task } from "./Task"

export function TaskList({
  list,
  onChangeListName,
  onAddTask,
  onChangeTask,
  onDeleteTask,
  onMoveTask,
  moveDestinations,
}: {
  list: Item
  onChangeListName: (name: string) => void
  onAddTask: (description: string) => void
  onChangeTask: (task: Item) => void
  onDeleteTask: (task: Item) => void
  onMoveTask: (task: Item, destination: Item) => void
  moveDestinations?: Item[]
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
      minHeight="316px"
      cursor="text"
      sx={{
        "--margin-width": "30px",
        "--margin-colour": "hsl(330 60% 85%)",
      }}
      paddingInlineStart="var(--margin-width)"
      background="linear-gradient(to right, transparent, transparent var(--margin-width), var(--margin-colour) var(--margin-width), var(--margin-colour) calc(var(--margin-width) + 2px), transparent calc(var(--margin-width) + 2px))"
    >
      <Heading
        as="h2"
        fontSize="20px"
        borderBottom="2px solid hsl(200 90% 80%)"
        marginInlineStart="calc(var(--margin-width) * -1)"
        paddingInlineStart="calc(var(--margin-width) + 8px)"
      >
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
          "--line-height": "33px",
        }}
        fontFamily="'Shadows Into Light', sans-serif"
        fontSize="24px"
        marginInlineStart="calc(var(--margin-width) * -1)"
        paddingInlineStart="calc(var(--margin-width) + 8px)"
        background="repeating-linear-gradient(transparent, transparent var(--line-height), var(--line-colour) var(--line-height), var(--line-colour) calc(var(--line-height) + 1px), transparent calc(var(--line-height) + 1px))"
      >
        {list.items &&
          Object.values(list.items).map((item) => (
            <chakra.li key={item.id} _last={{ marginBlockEnd: "40px" }}>
              <Task
                task={item}
                onChange={onChangeTask}
                onDelete={() => onDeleteTask(item)}
                actions={moveDestinations?.map((destination) => ({
                  label: `➡️ ${destination.description}`,
                  action: () => onMoveTask(item, destination),
                }))}
              />
            </chakra.li>
          ))}
        {addTaskFormVisible && (
          <chakra.li marginBlockStart="12px">
            <AddTaskForm
              onSubmit={onAddTask}
              onCancel={() => {
                setAddTaskFormVisible(false)
              }}
            />
          </chakra.li>
        )}
      </chakra.ul>
    </Box>
  )
}
