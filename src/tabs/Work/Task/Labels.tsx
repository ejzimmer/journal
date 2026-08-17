import { useContext, useMemo } from "react"
import { XIcon } from "../../../shared/icons/X"
import { FirebaseContext } from "../../../shared/FirebaseContext"
import { LabelsContext } from "../LabelsContext"
import { Label, LABELS_KEY } from "../types"
import { LabelColourPicker } from "./LabelColourPicker"

export function Labels({
  labelIds,
  onRemoveLabel,
}: {
  labelIds?: string[]
  onRemoveLabel: (id: string) => void
}) {
  const storageContext = useContext(FirebaseContext)
  if (!storageContext) {
    throw new Error("missing storage context")
  }

  const allLabels = useContext(LabelsContext)
  const labelsById = useMemo(
    () => new Map(allLabels?.map((label) => [label.id, label] as const)),
    [allLabels],
  )

  const labels = labelIds
    ?.map((id) => labelsById.get(id))
    .filter((label): label is Label => !!label)

  if (!labels || labels.length === 0) {
    return null
  }

  return (
    <ul className="labels">
      {labels.map((label) => (
        <li
          key={label.id}
          className={`label-tag ${label.colour}`}
          style={{ marginBlockStart: "-16px" }}
        >
          {label.value}
          <LabelColourPicker
            label={label.value}
            colour={label.colour}
            onChange={(colour) =>
              storageContext.updateItem(LABELS_KEY, { ...label, colour })
            }
          />
          <button
            className="ghost transient"
            aria-label={`Remove ${label.value}`}
            onClick={() => onRemoveLabel(label.id)}
          >
            <XIcon width="16px" />
          </button>
        </li>
      ))}
    </ul>
  )
}
