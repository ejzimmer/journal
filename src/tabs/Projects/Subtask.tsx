import { useContext, useState } from "react"
import { Checkbox } from "../../shared/controls/Checkbox"
import { ConfirmationModalDialog } from "../../shared/controls/ConfirmationModal"
import { FirebaseContext } from "../../shared/FirebaseContext"
import { ProjectSubtask } from "../../shared/types"
import { ArrowRightIcon } from "../../shared/icons/ArrowRight"
import { ButtonWithConfirmation } from "../../shared/controls/ButtonWithConfirmation"
import { useLinkedTasks } from "./utils"
import { EditableTextWithDelete } from "../../shared/controls/EditableTextWithDelete"

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
      <EditableTextWithDelete
        label="project"
        value={task.description}
        onChange={(description) => {
          updateTask({ ...task, description })
        }}
        onDelete={() => storageContext.deleteItem(path, task)}
        style={{ fontSize: "1em" }}
      />
      <ButtonWithConfirmation
        className={`icon ghost copy-button ${linkedTask ? "linked" : ""}`}
        onClick={onAddToTodo}
      >
        <ArrowRightIcon colour="var(--action-colour)" width="16px" />
      </ButtonWithConfirmation>
      <ConfirmationModalDialog
        message={`Are you sure you want to delete ${task.description}`}
        onConfirm={() => storageContext.deleteItem(path, task)}
        onCancel={() => setConfirmDeleteModalOpen(false)}
        isOpen={confirmDeleteModalOpen}
      />
    </li>
  )
}
