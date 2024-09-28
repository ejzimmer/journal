import { Task } from "./Task"

type TaskListProps = {
  tasks: string[]
}

export function TaskList({ tasks }: TaskListProps) {
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
    </>
  )
}
