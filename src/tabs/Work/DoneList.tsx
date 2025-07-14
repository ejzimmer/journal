import { useMemo } from "react"
import { Item } from "../../shared/TaskList/types"
import startOfWeek from "date-fns/startOfWeek"
import { format } from "date-fns"
import { Box, Button, chakra, Checkbox } from "@chakra-ui/react"

export function DoneList({
  tasks,
  onMarkNotDone,
  onDelete,
}: {
  tasks: Record<string, Item>
  onMarkNotDone: (task: Item) => void
  onDelete: (task: Item) => void
}) {
  const tasksByWeek = useMemo(
    () =>
      Object.groupBy(Object.values(tasks), (task) => {
        const weekCompleted = startOfWeek(new Date(task.lastUpdated))
        return format(weekCompleted, "dd MMM")
      }),
    [tasks]
  )

  return (
    <ul>
      {Object.entries(tasksByWeek)
        .reverse()
        .map(([week, tasks]) => (
          <Week
            key={week}
            week={week}
            tasks={tasks}
            onMarkNotDone={onMarkNotDone}
            onDelete={onDelete}
          />
        ))}
    </ul>
  )
}

function Week({
  week,
  tasks,
  onMarkNotDone,
  onDelete,
}: {
  week: string
  tasks?: Item[]
  onMarkNotDone: (task: Item) => void
  onDelete: (task: Item) => void
}) {
  if (!tasks) return null

  return (
    <li>
      {week}
      <ul>
        {tasks.map((task) => (
          <chakra.li
            key={task.id}
            display="flex"
            alignItems="center"
            gap=".5em"
          >
            <chakra.label
              display="inherit"
              alignItems="inherit"
              gap="inherit"
              opacity="0.5"
              cursor="pointer"
            >
              <Checkbox.Root
                aria-label={`mark ${task.description} not done`}
                checked
                onCheckedChange={() => onMarkNotDone(task)}
                color="gray"
              >
                <Checkbox.HiddenInput />
                <Checkbox.Control />
              </Checkbox.Root>
              <Box textDecoration="line-through">{task.description}</Box>
            </chakra.label>
            <Button
              onClick={() => onDelete(task)}
              aria-label={`delete ${task.description}`}
              variant="ghost"
              paddingInline="0"
              size="sm"
              opacity="0.5"
              _hover={{
                background: "transparent",
                opacity: 1,
              }}
            >
              🗑️
            </Button>
          </chakra.li>
        ))}
      </ul>
    </li>
  )
}
