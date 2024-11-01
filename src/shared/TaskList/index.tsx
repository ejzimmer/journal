import { Task } from "./Task"
import { useFetchItem } from "../storage/ItemManager"

type TaskListProps = {
  taskIds: string[]
  onChangeAllComplete?: (isComplete: boolean) => void
}

export function TaskList({ taskIds, onChangeAllComplete }: TaskListProps) {
  const getItem = useFetchItem()

  if (onChangeAllComplete) {
    Promise.all(taskIds.map(getItem)).then((tasks) => {
      onChangeAllComplete(tasks.every((task) => task.isComplete))
    })
  }

  return (
    <>
      {taskIds.length > 0 ? (
        <ul>
          {taskIds.map((id) => (
            <li key={id}>
              <Task id={id} />
            </li>
          ))}
        </ul>
      ) : (
        <div>No tasks</div>
      )}
    </>
  )
}
