import { XIcon } from "../../../shared/icons/X"
import { Label } from "../types"

export function Labels({
  labels,
  onRemoveLabel,
}: {
  labels?: Label[]
  onRemoveLabel: (label: Label) => void
}) {
  return (
    labels && (
      <ul className="labels">
        {labels?.map((label) => (
          <li
            key={label.value}
            className={`label-tag ${label.colour}`}
            style={{ marginBlockStart: "-16px" }}
          >
            {label.value}
            <button
              className="ghost transient"
              onClick={() => onRemoveLabel(label)}
            >
              <XIcon width="16px" />
            </button>
          </li>
        ))}
      </ul>
    )
  )
}
