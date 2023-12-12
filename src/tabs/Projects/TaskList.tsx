type Task = {
  id: string
  description: string
  isDone: boolean
}

type Props = {
  tasks: Task[]
  onAdd: (description: string) => void
}

export function TaskList({ tasks }: Props) {
  return (
    <ul>
      {tasks.map((task) => (
        <li key={task.id}>{task.description}</li>
      ))}
    </ul>
  )
}
