import { ChecklistIcon } from "../../../shared/icons/Checklist"
import { useWorkStorage } from "../WorkStorageContext"
import { STANDARD_CHECKLIST } from "../types"

type StandardChecklistButtonProps = {
  listId: string
  taskId: string
}

export function StandardChecklistButton({
  listId,
  taskId,
}: StandardChecklistButtonProps) {
  const { getTask, updateSubtasksList } = useWorkStorage()

  const existing = Object.values(getTask(listId, taskId)?.subtasks ?? {})
  const existingIds = new Set(existing.map((subtask) => subtask.id))
  const allAdded = STANDARD_CHECKLIST.keys().every((id) =>
    existingIds.has(id),
  )

  if (allAdded) {
    return null
  }

  const addStandardChecklist = () => {
    const highestPosition = existing.reduce(
      (max, subtask) => Math.max(max, subtask.position ?? -1),
      -1,
    )
    const newSubtasks = [
      ...STANDARD_CHECKLIST.entries()
        .filter(([id]) => !existingIds.has(id))
        .map(([id, description], index) => ({
          id,
          description,
          position: highestPosition + 1 + index,
        })),
    ]
    updateSubtasksList(listId, taskId, [...existing, ...newSubtasks])
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
