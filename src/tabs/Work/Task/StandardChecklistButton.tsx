import { ChecklistIcon } from "../../../shared/icons/Checklist"
import { useWorkStorage } from "../WorkStorageContext"
import { STANDARD_CHECKLIST, Subtask } from "../types"

type StandardChecklistButtonProps = {
  subtasks?: Record<string, Subtask>
  listId: string
  taskId: string
  onAdd?: () => void
}

export function StandardChecklistButton({
  subtasks,
  listId,
  taskId,
  onAdd,
}: StandardChecklistButtonProps) {
  const { addSubtask } = useWorkStorage()

  const existingDescriptions = Object.values(subtasks ?? {}).map((subtask) =>
    subtask.description.toLowerCase(),
  )
  const allAdded = STANDARD_CHECKLIST.every((description) =>
    existingDescriptions.includes(description.toLowerCase()),
  )

  if (allAdded) {
    return null
  }

  const addStandardChecklist = () => {
    const existing = Object.values(subtasks ?? {}).map((subtask) =>
      subtask.description.toLowerCase(),
    )
    STANDARD_CHECKLIST.forEach((description) => {
      if (!existing.includes(description.toLowerCase())) {
        addSubtask(listId, taskId, description)
      }
    })
    onAdd?.()
  }

  return (
    <button
      type="button"
      className="add-metadata ghost"
      aria-label="Add standard checklist"
      onClick={addStandardChecklist}
    >
      <ChecklistIcon width="16px" />
    </button>
  )
}
