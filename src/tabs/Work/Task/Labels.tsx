import { LabelTags } from "../LabelTags"
import { useWorkStorage } from "../WorkStorageContext"
import { StoredLabel } from "../types"

export function Labels({
  labelIds,
  onRemoveLabel,
  onEditLabel,
}: {
  labelIds?: string[]
  onRemoveLabel: (id: string) => void
  onEditLabel?: (id: string) => void
}) {
  const { getLabel, updateLabel } = useWorkStorage()

  const labels = labelIds
    ?.map((id) => getLabel(id))
    .filter((label): label is StoredLabel => !!label)

  return (
    <LabelTags
      labels={labels ?? []}
      onRemoveLabel={onRemoveLabel}
      onChangeColour={updateLabel}
      onEditLabel={onEditLabel}
    />
  )
}
