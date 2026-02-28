import { useContext, useState } from "react"
import { Checkbox } from "../../shared/controls/Checkbox"
import { ConfirmationModalDialog } from "../../shared/controls/ConfirmationModal"
import { EditableText } from "../../shared/controls/EditableText"
import { FirebaseContext } from "../../shared/FirebaseContext"
import { ProjectSubtask } from "../../shared/types"
import { ArrowRightIcon } from "../../shared/icons/ArrowRight"
import { ButtonWithConfirmation } from "../../shared/controls/ButtonWithConfirmation"
import { useLinkedTasks } from "./utils"

type SubtaskProps = ProjectSubtask & {
  path: string
}

export function Subtask({ path, ...task }: SubtaskProps) {
  const [confirmDeleteModalOpen, setConfirmDeleteModalOpen] = useState(false)

  const storageContext = useContext(FirebaseContext)
  if (!storageContext) {
    throw new Error("Missing Firebase context provider")
  }

  const {
    linkedTask,
    createLinkedTask: createDailyTask,
    updateLinkedTask,
  } = useLinkedTasks(task.linkedId)

  const updateTask = (task: ProjectSubtask) => {
    storageContext.updateItem<ProjectSubtask>(path, task)
  }

  const onAddToTodo = () => {
    const linkedId = createDailyTask({
      description: task.description,
      category: task.category,
      linkedTaskId: `${path}/${task.id}`,
    })

    if (linkedId) updateTask({ ...task, linkedId })
    return !!linkedId
  }

  const handleChange = () => {
    const status = task.status === "done" ? "ready" : "done"
    updateTask({ ...task, status })

    updateLinkedTask({
      status,
      lastCompleted: new Date().getTime(),
    })
  }

  return (
    <li className="subtask">
      <Checkbox
        isChecked={task.status === "done"}
        onChange={handleChange}
        aria-label={`${task.description} ${task.status}`}
      />
      <EditableText
        label="project"
        onChange={(description) => {
          if (!description) {
            setConfirmDeleteModalOpen(true)
            return
          }
          updateTask({ ...task, description })
        }}
        style={{ fontSize: "1em" }}
      >
        {task.description}
      </EditableText>
      <ButtonWithConfirmation
        className={`icon ghost copy-button ${linkedTask ? "linked" : ""}`}
        onClick={onAddToTodo}
      >
        <ArrowRightIcon colour="var(--action-colour)" width="16px" />
      </ButtonWithConfirmation>
      <ConfirmationModalDialog
        message={`Are you sure you want to delete ${task.description}`}
        onConfirm={() => storageContext.deleteItem(path, task)}
        isOpen={confirmDeleteModalOpen}
      />
    </li>
  )
}
