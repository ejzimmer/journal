import { useContext } from "react"
import { ChecklistIcon } from "../../../shared/icons/Checklist"
import { FirebaseContext } from "../../../shared/FirebaseContext"
import { STANDARD_CHECKLIST, Subtask } from "../types"

type StandardChecklistButtonProps = {
  subtasks?: Record<string, Subtask>
  path: string
  onAdd?: () => void
}

export function StandardChecklistButton({
  subtasks,
  path,
  onAdd,
}: StandardChecklistButtonProps) {
  const storageContext = useContext(FirebaseContext)
  if (!storageContext) {
    throw new Error("missing firebase context")
  }

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
        storageContext.addItem(path, { description })
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
