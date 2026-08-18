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
    // Written as one atomic list: every standard-checklist item - whether
    // it already existed or is being added now - is laid out in
    // STANDARD_CHECKLIST's declared order, so the preset order always
    // holds regardless of which items existed beforehand or write timing.
    // Custom (non-standard) subtasks keep their existing relative order,
    // ahead of the standard block.
    const custom = existing.filter(
      (subtask) =>
        !STANDARD_CHECKLIST.some(
          (description) => description.toLowerCase() === subtask.description.toLowerCase(),
        ),
    )
    const standardBlock = STANDARD_CHECKLIST.map((description) => {
      const existingItem = existing.find(
        (subtask) => subtask.description.toLowerCase() === description.toLowerCase(),
      )
      return existingItem ?? { id: idFor(description), description }
    })
    const newSubtasks = [...custom, ...standardBlock].map((subtask, index) => ({
      ...subtask,
      position: index,
    }))
    setSubtasks(listId, taskId, newSubtasks)
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
