import { XIcon } from "../../../shared/icons/X"
import { useWorkStorage } from "../WorkStorageContext"
import { StoredLabel } from "../types"
import { LabelColourPicker } from "./LabelColourPicker"

export function Labels({
  labelIds,
  onRemoveLabel,
}: {
  labelIds?: string[]
  onRemoveLabel: (id: string) => void
}) {
  const { getLabel, updateLabel } = useWorkStorage()

  const labels = labelIds
    ?.map((id) => getLabel(id))
    .filter((label): label is StoredLabel => !!label)

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
            onChange={(colour) => updateLabel(label.id, colour)}
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
