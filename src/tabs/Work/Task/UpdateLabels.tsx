import { useEffect, useRef, useState } from "react"
import { TagIcon } from "../../../shared/icons/Tag"
import { LabelsControl } from "../LabelsControl"
import { Label } from "../types"

export function UpdateLabels({
  onAddLabel,
}: {
  onAddLabel: (label: Label) => void
}) {
  const [addingLabel, setAddingLabel] = useState(false)
  const addLabelButtonRef = useRef<HTMLButtonElement>(null)
  const hasOpenedLabelsControl = useRef(false)

  useEffect(() => {
    if (addingLabel) {
      hasOpenedLabelsControl.current = true
      return
    }

    if (hasOpenedLabelsControl.current) {
      addLabelButtonRef.current?.focus()
    }
  }, [addingLabel])

  return addingLabel ? (
    <LabelsControl
      value={[]}
      onChange={(labels) => {
        labels.forEach(onAddLabel)
        setAddingLabel(false)
      }}
      label=""
      ariaLabel="Labels"
      onDismiss={() => setAddingLabel(false)}
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
