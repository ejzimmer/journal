import { useContext, useState } from "react"
import { Checkbox } from "../../shared/controls/Checkbox"
import { ConfirmationModalDialog } from "../../shared/controls/ConfirmationModal"
import { EditableText } from "../../shared/controls/EditableText"
import { Task } from "./types"
import { FirebaseContext } from "../../shared/FirebaseContext"

type SubtaskProps = Task & {
  onUpdate: (task: Task) => void
  onDelete: () => void
}

export function Subtask({ onUpdate, onDelete, ...task }: SubtaskProps) {
  const [confirmDeleteModalOpen, setConfirmDeleteModalOpen] = useState(false)

  const storageContext = useContext(FirebaseContext)
  if (!storageContext) {
    throw new Error("Missing Firebase context provider")
  }

  // const onMoveToTodo = () => {
  //   storageContext.addItem<>()
  // }

  return (
    <li className="subtask">
      <Checkbox
        isChecked={task.status === "done"}
        onChange={() => {
          onUpdate({
            ...task,
            status: task.status === "done" ? "ready" : "done",
          })
        }}
        aria-label={`${task.description} ${task.status}`}
      />
      <EditableText
        label="project"
        onChange={(description) => {
          if (!description) {
            setConfirmDeleteModalOpen(true)
            return
          }
          onUpdate({ ...task, description })
        }}
        style={{ fontSize: "1em" }}
      >
        {task.description}
      </EditableText>
      <button>Add to todo</button>
      <ConfirmationModalDialog
        message={`Are you sure you want to delete ${task.description}`}
        onConfirm={onDelete}
        isOpen={confirmDeleteModalOpen}
      />
    </li>
  )
}
