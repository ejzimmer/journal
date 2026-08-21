import { ChecklistIcon } from "../../../shared/icons/Checklist"
import { useWorkStorage } from "../WorkStorageContext"
import { STANDARD_CHECKLIST, Subtask } from "../types"

type StandardChecklistButtonProps = {
  subtasks?: Record<string, Subtask>
  listId: string
  taskId: string
  onAdd?: () => void
}

// Deterministic per-description ids for standard checklist items. Clicking
// this button writes the same id/description pairs every time, so repeat
// clicks - or a click landing before an earlier one's writes have synced
// back down - just rewrite the same keys with the same values instead of
// racing a "does this already exist" check against in-flight writes and
// creating duplicates or clobbering data.
const idFor = (description: string) =>
  `standard-${description.toLowerCase().replace(/\s+/g, "-")}`

export function StandardChecklistButton({
  subtasks,
  listId,
  taskId,
  onAdd,
}: StandardChecklistButtonProps) {
  const { setSubtasks } = useWorkStorage()

  const existing = Object.values(subtasks ?? {})
  const existingDescriptions = existing.map((subtask) =>
    subtask.description.toLowerCase(),
  )
  const allAdded = STANDARD_CHECKLIST.every((description) =>
    existingDescriptions.includes(description.toLowerCase()),
  )

  if (allAdded) {
    return null
  }

  const addStandardChecklist = () => {
    const highestPosition = existing.reduce(
      (max, subtask) => Math.max(max, subtask.position),
      -1,
    )
    const missing = STANDARD_CHECKLIST.filter(
      (description) => !existingDescriptions.includes(description.toLowerCase()),
    )
    const newSubtasks = missing.map((description, index) => ({
      id: idFor(description),
      description,
      position: highestPosition + 1 + index,
    }))
    setSubtasks(listId, taskId, [...existing, ...newSubtasks])
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
