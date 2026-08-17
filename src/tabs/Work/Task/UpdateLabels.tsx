import { useState } from "react"
import { TagIcon } from "../../../shared/icons/Tag"
import { LabelsControl } from "../LabelsControl"
import { Label } from "../types"

export function UpdateLabels({
  labels,
  onUpdateLabels,
}: {
  labels?: Label[]
  onUpdateLabels: (labels: Label[]) => void
}) {
  const [addingLabel, setAddingLabel] = useState(false)

  return addingLabel ? (
    <LabelsControl
      value={[]}
      onChange={(value) => {
        const uniqueLabels = new Map<string, Label>(
          labels?.map((label) => [label.value, label])
        )
        value.forEach((label) => {
          uniqueLabels.set(label.value, label)
        })
        onUpdateLabels(Array.from(uniqueLabels.values()))
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
