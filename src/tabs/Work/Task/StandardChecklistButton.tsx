import { ChecklistIcon } from "../../../shared/icons/Checklist"
import { useWorkStorage } from "../WorkStorageContext"
import { STANDARD_CHECKLIST } from "../types"

type StandardChecklistButtonProps = {
  listId: string
  taskId: string
  onAdd?: () => void
}

const idFor = (description: string) =>
  `standard-${description.toLowerCase().replace(/\s+/g, "-")}`

export function StandardChecklistButton({
  listId,
  taskId,
  onAdd,
}: StandardChecklistButtonProps) {
  const { getTask, updateSubtasksList } = useWorkStorage()

  const existing = Object.values(getTask(listId, taskId)?.subtasks ?? {})
  const existingIds = new Set(existing.map((subtask) => subtask.id))
  const allAdded = STANDARD_CHECKLIST.every((description) =>
    existingIds.has(idFor(description)),
  )

  if (allAdded) {
    return null
  }

  const addStandardChecklist = () => {
    const highestPosition = existing.reduce(
      (max, subtask) => Math.max(max, subtask.position ?? -1),
      -1,
    )
    const missing = STANDARD_CHECKLIST.filter(
      (description) => !existingIds.has(idFor(description)),
    )
    const newSubtasks = missing.map((description, index) => ({
      id: idFor(description),
      description,
      position: highestPosition + 1 + index,
    }))
    updateSubtasksList(listId, taskId, [...existing, ...newSubtasks])
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
