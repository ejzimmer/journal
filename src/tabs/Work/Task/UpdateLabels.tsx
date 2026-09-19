import { useRef, useState } from "react"
import { flushSync } from "react-dom"
import { TagIcon } from "../../../shared/icons/Tag"
import { LabelsControl } from "../LabelsControl"
import { Label } from "../types"

export function UpdateLabels({
  labels = [],
  onChangeLabels,
}: {
  labels?: Label[]
  onChangeLabels: (labels: Label[]) => void
}) {
  const [addingLabel, setAddingLabel] = useState(false)
  const addLabelButtonRef = useRef<HTMLButtonElement>(null)

  const stopAddingLabel = () => {
    flushSync(() => setAddingLabel(false))
    addLabelButtonRef.current?.focus()
  }

  return addingLabel ? (
    <LabelsControl
      value={labels}
      onChange={(labels) => {
        onChangeLabels(labels)
        stopAddingLabel()
      }}
      label=""
      ariaLabel="Labels"
      onDismiss={stopAddingLabel}
    />
  ) : (
    <button
      ref={addLabelButtonRef}
      type="button"
      className="add-metadata ghost"
      aria-label="Add label"
      onClick={() => setAddingLabel(true)}
    >
      <TagIcon width="28px" />
    </button>
  )
}
