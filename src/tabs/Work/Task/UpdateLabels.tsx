import { useState } from "react"
import { PlusIcon } from "../../../shared/icons/Plus"
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
    <button className="add-metadata ghost" onClick={() => setAddingLabel(true)}>
      <PlusIcon width="16px" />
    </button>
  )
}
