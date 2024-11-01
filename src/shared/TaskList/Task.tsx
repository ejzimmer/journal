import { Checkbox } from "../controls/Checkbox"
import { useItem } from "../storage/ItemManager"
import { DeleteTaskButton } from "./DeleteTaskButton"
import { TaskButton } from "./TaskButton"
import { useEffect, useRef, useState } from "react"
import { ItemDescription } from "./ItemDescription"
import { AddTaskForm } from "./AddTaskForm"
import { TaskList } from "."
import { Box } from "@chakra-ui/react"
import invariant from "tiny-invariant"
import { draggable } from "@atlaskit/pragmatic-drag-and-drop/element/adapter"

type TaskProps = {
  id: string
}

export function Task({ id }: TaskProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [isAddingNewTask, setAddingNewTask] = useState(false)
  const {
    item: task,
    isLoading,
    error,
    onChange,
    onDelete,
    onAddItem: onAddTask,
  } = useItem(id)

  useEffect(() => {
    const element = ref.current
    if (!element) return
    invariant(element)

    return draggable({
      element,
      getInitialData: () => ({ location, pieceType }),
    })
  }, [])

  if (isLoading) {
    return <div>Loading...</div>
  }

  if (error || !task) {
    return <div>{error?.message ?? "Unable to load task"}</div>
  }

  return (
    <Box border="1px solid black" ref={ref}>
      <Checkbox
        label={`${task.description}`}
        isChecked={task.isComplete}
        onChange={() => {
          const isComplete = !task.isComplete
          onChange({ ...task, isComplete })
        }}
      />
      <ItemDescription
        description={task.description}
        onChange={(description) => onChange({ ...task, description })}
        isDone={task.isComplete}
      />
      <TaskButton
        aria-label={`Add subtask to ${task.description}`}
        onClick={() => setAddingNewTask(true)}
      >
        +
      </TaskButton>
      <DeleteTaskButton
        taskDescription={task.description}
        onDelete={onDelete}
      />
      {isAddingNewTask && (
        <AddTaskForm
          onSubmit={onAddTask}
          onCancel={() => setAddingNewTask(false)}
        />
      )}
      {task.items?.length && <TaskList taskIds={task.items} />}
    </Box>
  )
}
