import { NewTaskForm } from "./NewTaskForm"

type Task = {
  id: string
  description: string
  isDone: boolean
}

type Props = {
  tasks: Task[]
  onAdd: (description: string) => void
}

export function TaskList({ tasks, onAdd }: Props) {
  return (
    <>
      <ul>
        {tasks.map((task) => (
          <li key={task.id}>{task.description}</li>
        ))}
      </ul>
      <NewTaskForm onSubmit={onAdd} />
    </>
  )
}
