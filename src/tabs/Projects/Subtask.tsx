import { useContext, useState } from "react"
import { Checkbox } from "../../shared/controls/Checkbox"
import { ConfirmationModalDialog } from "../../shared/controls/ConfirmationModal"
import { EditableText } from "../../shared/controls/EditableText"
import { Task } from "./types"
import { FirebaseContext } from "../../shared/FirebaseContext"
import { DAILY_KEY, DailyTask } from "../../shared/types"
import { OrderedListItem } from "../../shared/drag-and-drop/types"
import { ArrowRightIcon } from "../../shared/icons/ArrowRight"

type SubtaskProps = Task & {
  onUpdate: (task: Task) => void
  onDelete: () => void
}

export function Subtask({ onUpdate, onDelete, ...task }: SubtaskProps) {
  const [copyButtonVisible, setCopyButtonVisible] = useState(true)
  const [successConfirmationVisible, setSuccessConfirmationVisible] =
    useState(false)
  const [confirmDeleteModalOpen, setConfirmDeleteModalOpen] = useState(false)

  const storageContext = useContext(FirebaseContext)
  if (!storageContext) {
    throw new Error("Missing Firebase context provider")
  }

  const { value: linkedTask } = storageContext.useValue(
    `${DAILY_KEY}/${task.linkedId}`,
  )
  if (task.linkedId && linkedTask && copyButtonVisible) {
    setCopyButtonVisible(false)
  }

  const onAddToTodo = () => {
    const linkedId = storageContext.addItem<
      Omit<DailyTask, keyof OrderedListItem>
    >(DAILY_KEY, {
      category: { emoji: task.category, text: task.category },
      description: task.description,
      status: task.status === "in_progress" ? "ready" : task.status,
      type: "一度",
      lastCompleted: new Date().getTime(),
    })

    if (linkedId) onUpdate({ ...task, linkedId })
    setSuccessConfirmationVisible(true)
    // don't show button if already added to todo. but check.
    // when item is ticked off here, tick it off in todo
    // when item is ticked off in todo, tick it off here
    // add a project with subtasks to todo => just move all the subtasks
    // add a project without subtasks to todo => move the project as a single task
  }

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
      {copyButtonVisible && (
        <button className="icon ghost copy-button" onClick={onAddToTodo}>
          <ArrowRightIcon colour="var(--action-colour)" width="16px" />
        </button>
      )}
      {successConfirmationVisible && (
        <div
          className="confirmation"
          onAnimationEnd={() => setSuccessConfirmationVisible(false)}
        >
          Copied!
        </div>
      )}
      <ConfirmationModalDialog
        message={`Are you sure you want to delete ${task.description}`}
        onConfirm={onDelete}
        isOpen={confirmDeleteModalOpen}
      />
    </li>
  )
}
