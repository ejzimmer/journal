import { Checkbox } from "../controls/Checkbox"
import { useItem } from "../storage/Context"
import { DeleteTaskButton } from "./DeleteTaskButton"
import { TaskButton } from "./TaskButton"
import { useState } from "react"
import { ItemDescription } from "./ItemDescription"
import { AddTaskForm } from "./AddTaskForm"
import { TaskList } from "."

export function Task({ id }: { id: string }) {
  const [isAddingNewTask, setAddingNewTask] = useState(false)
  const { item, error, isLoading, onChange, onDelete, onAddTask } = useItem(id)

  if (isLoading) {
    return <div>Loading...</div>
  }

  if (error || !item) {
    return <div>{error?.message ?? "Could not find item"}</div>
  }

  return (
    <>
      <Checkbox
        label={`${item.description}`}
        isChecked={item.isComplete}
        onChange={() => {
          onChange({ ...item, isComplete: !item.isComplete })
        }}
      />
      <ItemDescription
        description={item.description}
        onChange={(description) => onChange({ ...item, description })}
        isDone={item.isComplete}
      />
      <TaskButton
        aria-label={`Add subtask to ${item.description}`}
        onClick={() => setAddingNewTask(true)}
      >
        +
      </TaskButton>
      <DeleteTaskButton
        taskDescription={item.description}
        onDelete={onDelete}
      />
      {isAddingNewTask && (
        <AddTaskForm
          onSubmit={onAddTask}
          onCancel={() => setAddingNewTask(false)}
        />
      )}
      {item.items?.length && <TaskList tasks={item.items} />}
    </>
  )
}
