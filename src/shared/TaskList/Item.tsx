import { useEffect, useState } from "react"
import { Checkbox } from "../controls/Checkbox"
import { EditableText } from "../controls/EditableText"
import { useFetchTask, useUpdateTask } from "../storage/Context"
import { DeleteTaskButton } from "./DeleteTaskButton"
import { Task } from "./types"

export type Props = {
  id: string
}

export function Item({ id }: Props) {
  const [task, setTask] = useState<Task>()
  const [error, setError] = useState<string>()

  const { getTask } = useFetchTask(id)
  const { onChange, onDelete } = useUpdateTask(id)

  useEffect(() => {
    getTask(id).then(setTask).catch(setError)
  }, [id, getTask])

  if (error) {
    return <div>{error}</div>
  }

  if (!task) {
    return <div>Loading...</div>
  }

  return (
    <li>
      <Checkbox
        label={`${task.description}`}
        isChecked={task.isDone}
        onChange={() => {
          onChange({ ...task, isDone: !task.isDone })
        }}
      />
      <ItemDescription
        description={task.description}
        onChange={(description) => onChange({ ...task, description })}
        isDone={task.isDone}
      />
      <DeleteTaskButton
        taskDescription={task.description}
        onDelete={onDelete}
      />
    </li>
  )
}

type ItemDescriptionProps = {
  onChange: (description: string) => void
  description: string
  isDone: boolean
}
function ItemDescription({
  description,
  isDone,
  onChange,
}: ItemDescriptionProps) {
  return (
    <EditableText
      onChange={onChange}
      paddingInlineStart=".25em"
      paddingBlockStart=".3em"
      paddingBlockEnd=".1em"
      textDecoration={isDone ? "line-through" : "none"}
    >
      {description}
    </EditableText>
  )
}
