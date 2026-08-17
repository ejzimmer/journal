import { useState } from "react"
import { TagIcon } from "../../../shared/icons/Tag"
import { LabelsControl } from "../LabelsControl"

export function UpdateLabels({
  labelIds,
  onUpdateLabels,
}: {
  labelIds?: string[]
  onUpdateLabels: (labelIds: string[]) => void
}) {
  const [addingLabel, setAddingLabel] = useState(false)

  return addingLabel ? (
    <LabelsControl
      value={[]}
      onChange={(newIds) => {
        const merged = Array.from(new Set([...(labelIds ?? []), ...newIds]))
        onUpdateLabels(merged)
        setAddingLabel(false)
      }}
      label=""
    />
  ) : (
    <button
      className="add-metadata ghost"
      aria-label="Add label"
      onClick={() => setAddingLabel(true)}
    >
      <TagIcon width="28px" />
    </button>
  )
}
