import { useContext } from "react"
import { UpdateItem } from "../storage/Context"
import { AddTaskForm } from "./AddTaskForm"
import { Task } from "./Task"

type TaskListProps = {
  tasks: string[]
}

export function TaskList({ tasks }: TaskListProps) {
  const { onAddTask } = useContext(UpdateItem)

  return (
    <>
      {tasks.length > 0 ? (
        <ul>
          {tasks.map((task) => (
            <li key={task}>
              <Task id={task} />
            </li>
          ))}
        </ul>
      ) : (
        <div>No tasks</div>
      )}
      <AddTaskForm onSubmit={onAddTask} onCancel={() => undefined} />
    </>
  )
}
