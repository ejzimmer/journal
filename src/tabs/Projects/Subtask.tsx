import { useContext, useState } from "react"
import { Checkbox } from "../../shared/controls/Checkbox"
import { ConfirmationModalDialog } from "../../shared/controls/ConfirmationModal"
import { EditableText } from "../../shared/controls/EditableText"
import { FirebaseContext } from "../../shared/FirebaseContext"
import { DAILY_KEY, DailyTask, ProjectSubtask } from "../../shared/types"
import { OrderedListItem } from "../../shared/drag-and-drop/types"
import { ArrowRightIcon } from "../../shared/icons/ArrowRight"

type SubtaskProps = ProjectSubtask & {
  path: string
}

export function Subtask({ path, ...task }: SubtaskProps) {
  const [copyButtonVisible, setCopyButtonVisible] = useState(true)
  const [successConfirmationVisible, setSuccessConfirmationVisible] =
    useState(false)
  const [confirmDeleteModalOpen, setConfirmDeleteModalOpen] = useState(false)

  const storageContext = useContext(FirebaseContext)
  if (!storageContext) {
    throw new Error("Missing Firebase context provider")
  }

  const { value: linkedTask } = storageContext.useValue<DailyTask>(
    task.linkedId && `${DAILY_KEY}/${task.linkedId}`,
  )
  if (linkedTask && copyButtonVisible) {
    setCopyButtonVisible(false)
  }

  const updateTask = (task: ProjectSubtask) => {
    storageContext.updateItem<ProjectSubtask>(path, task)
  }

  const onAddToTodo = () => {
    const linkedId = storageContext.addItem<
      Omit<DailyTask, keyof OrderedListItem>
    >(DAILY_KEY, {
      category: { emoji: task.category, text: task.category },
      description: task.description,
      status: task.status === "done" ? "finished" : task.status,
      type: "一度",
      lastCompleted: new Date().getTime(),
      linkedTask: `${path}/${task.id}`,
    })

    if (linkedId) updateTask({ ...task, linkedId })
    setSuccessConfirmationVisible(true)
    // add a project with subtasks to todo => just move all the subtasks
    // add a project without subtasks to todo => move the project as a single task
  }

  const handleChange = () => {
    const status = task.status === "done" ? "ready" : "done"
    updateTask({ ...task, status })

    if (!linkedTask) return

    storageContext.updateItem<DailyTask>(DAILY_KEY, {
      ...linkedTask,
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
        onConfirm={() => storageContext.deleteItem(path, task)}
        isOpen={confirmDeleteModalOpen}
      />
    </li>
  )
}
