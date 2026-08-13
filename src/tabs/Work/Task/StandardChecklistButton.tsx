import { useContext } from "react"
import { ChecklistIcon } from "../../../shared/icons/Checklist"
import { FirebaseContext } from "../../../shared/FirebaseContext"
import { STANDARD_CHECKLIST, Subtask } from "../types"

type StandardChecklistButtonProps = {
  subtasks?: Record<string, Subtask>
  path: string
}

export function StandardChecklistButton({
  subtasks,
  path,
}: StandardChecklistButtonProps) {
  const storageContext = useContext(FirebaseContext)
  if (!storageContext) {
    throw new Error("missing firebase context")
  }

  const existing = new Set(
    Object.values(subtasks ?? {}).map((subtask) =>
      subtask.description.toLowerCase(),
    ),
  )
  const missing = STANDARD_CHECKLIST.filter(
    (description) => !existing.has(description.toLowerCase()),
  )

  const addStandardChecklist = () => {
    missing.forEach((description, index) => {
      storageContext.addItem(path, {
        description,
        position: existing.size + index,
      })
    })
  }

  return (
    <button
      type="button"
      className="add-metadata ghost"
      aria-label="Add standard checklist"
      onClick={addStandardChecklist}
      disabled={missing.length === 0}
    >
      <ChecklistIcon width="16px" />
    </button>
  )
}
