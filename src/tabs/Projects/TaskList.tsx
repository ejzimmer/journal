import { Button } from "@chakra-ui/react"
import { NewTaskForm } from "./NewTaskForm"
import { EditableLabel } from "./style"
import { EditableText } from "./EditableText"

type Task = {
  id: string
  description: string
  isDone: boolean
}

type Props = {
  tasks: Task[]
  onAdd: (description: string) => void
  onChange: (task: Task) => void
  onDelete: (id: string) => void
}

export function TaskList({ tasks, onAdd, onChange, onDelete }: Props) {
  const onUpdate = (task: Task) => {
    if (task.description) {
      onChange(task)
    } else {
      onDelete(task.id)
    }
  }

  return (
    <>
      <ul>
        {tasks.map((task) => (
          <li key={task.id}>
            <EditableText
              onChange={(description) => onUpdate({ ...task, description })}
              paddingStart=".25em"
              marginStart=".25em"
              paddingTop=".3em"
              paddingBottom=".1em"
              height="unset"
              textDecoration={task.isDone ? "line-through" : "none"}
            >
              {task.description}
            </EditableText>
            <Button
              aria-label={`Delete ${task.description}`}
              onClick={() => onDelete(task.id)}
            >
              x
            </Button>
          </li>
        ))}
      </ul>
      <NewTaskForm onSubmit={onAdd} />
    </>
  )
}
