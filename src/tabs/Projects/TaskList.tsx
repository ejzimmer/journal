import { Button } from "@chakra-ui/react"
import { NewTaskForm } from "./NewTaskForm"
import { EditableText } from "../../shared/controls/EditableText"
import { Checkbox } from "../../shared/controls/Checkbox"

type Task = {
  id: string
  description: string
  isDone: boolean
  tasks?: Task[]
}

type UpdateTask = Omit<Task, "tasks"> & { tasks?: Partial<Task>[] }

type Props = {
  tasks: Task[]
  onAdd: (description: string) => void
  onChange: (task: UpdateTask) => void
  onDelete: (id: string) => void
  isSubtaskList?: boolean
}

export function TaskList({
  tasks,
  onAdd,
  onChange,
  onDelete,
  isSubtaskList,
}: Props) {
  const onUpdate = (task: Task) => {
    if (task.description) {
      onChange(task)
    } else {
      onDelete(task.id)
    }
  }

  const addSubtask = (task: Task, subtaskDescription: string) => {
    onChange({
      ...task,
      tasks: [...(task.tasks ?? []), { description: subtaskDescription }],
    })
  }
  const updateSubtask = (task: Task, subtask: Task) => {
    if (typeof task.tasks === "undefined") {
      throw new Error("task does not have subtasks")
    }
    const indexToUpdate = task.tasks?.findIndex(
      (task) => task.id === subtask.id
    )
    if (indexToUpdate === -1) {
      throw new Error("could not find task")
    }

    const updatedTasks = tasks.with(indexToUpdate, subtask)
    onChange({ ...task, tasks: updatedTasks })
  }
  const deleteSubtask = () => {}

  return (
    <>
      <ul>
        {tasks.map((task) => (
          <li key={task.id}>
            <Checkbox
              label={`${task.description} done`}
              isChecked={task.isDone}
              onChange={() => {
                onUpdate({ ...task, isDone: !task.isDone })
              }}
            />
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
            {!Array.isArray(task.tasks) && (
              <Button
                aria-label={`Add subtasks to ${task.description}`}
                onClick={() => onChange({ ...task, tasks: [] })}
              >
                +
              </Button>
            )}
            <Button
              aria-label={`Delete ${task.description}`}
              onClick={() => onDelete(task.id)}
            >
              x
            </Button>
            {Array.isArray(task.tasks) && (
              <TaskList
                tasks={task.tasks}
                isSubtaskList
                onAdd={(subtaskDescription) =>
                  addSubtask(task, subtaskDescription)
                }
                onChange={(subtask) => updateSubtask(task, subtask)}
                onDelete={deleteSubtask}
              />
            )}
          </li>
        ))}
      </ul>
      <NewTaskForm onSubmit={onAdd} isSubtaskList={isSubtaskList} />
    </>
  )
}
