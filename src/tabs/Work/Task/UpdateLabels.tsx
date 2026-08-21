import { useState } from "react"
import { TagIcon } from "../../../shared/icons/Tag"
import { LabelsControl } from "../LabelsControl"
import { Label } from "../types"

export function UpdateLabels({
  onAddLabel,
}: {
  onAddLabel: (label: Label) => void
}) {
  const [addingLabel, setAddingLabel] = useState(false)

  return addingLabel ? (
    <LabelsControl
      value={[]}
      onChange={(labels) => {
        labels.forEach(onAddLabel)
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
