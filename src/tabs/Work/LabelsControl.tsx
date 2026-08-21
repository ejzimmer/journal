import { ReactNode, useMemo } from "react"
import { COLOURS, Colour, StoredLabel } from "./types"
import { Combobox } from "../../shared/controls/combobox/Combobox"
import { useWorkStorage } from "./WorkStorageContext"

export type LabelsControlProps = {
  value: string[]
  onChange: (value: string[]) => void
  label: string
  hideLabel?: boolean
  isMulti?: boolean
  autoFocus?: boolean
}

type LabelOption = {
  id: string
  label: string
  colour: Colour
}

const isColour = (text?: string): text is Colour =>
  !!(text && COLOURS.find((c) => c === text))

export function getNextColour(colours: Colour[]): Colour {
  let firstUnused = COLOURS.find((c) => !colours.includes(c))
  if (firstUnused) {
    return firstUnused
  }

  const usageCount = colours.reduce(
    (usages, colour) => {
      usages[colour] = (usages[colour] ?? 0) + 1
      return usages
    },
    {} as Record<(typeof COLOURS)[number], number>,
  )
  const lowestUsage = Math.min(...Object.values(usageCount))
  const lowestUsageColour = Object.entries(usageCount).find(
    ([, count]) => count === lowestUsage,
  )?.[0]

  return isColour(lowestUsageColour) ? lowestUsageColour : COLOURS[0]
}

export function LabelsControl({
  value,
  onChange,
  label,
  isMulti = true,
  autoFocus,
}: LabelsControlProps) {
  const { labels, resolveLabel } = useWorkStorage()

  const labelsById = useMemo(
    () => new Map(labels.map((l) => [l.id, l] as const)),
    [labels],
  )

  const options: LabelOption[] = useMemo(
    () =>
      labels.map(({ id, value, colour }) => ({
        id,
        label: value,
        colour,
      })),
    [labels],
  )

  const selectedOptions: LabelOption[] = useMemo(
    () =>
      value
        .map((id) => labelsById.get(id))
        .filter((l): l is StoredLabel => !!l)
        .map((l) => ({ id: l.id, label: l.value, colour: l.colour })),
    [value, labelsById],
  )

  const createOption = (text: string): LabelOption => {
    const colour = getNextColour(options.map((option) => option.colour))
    const id = resolveLabel({ value: text, colour })
    return {
      id,
      label: text,
      colour,
    }
  }

  // Revives a selected label that's pending removal, clearing its
  // lastRemoved flag so it doesn't get swept away while back in use.
  // Options that are already active, or were just created by createOption
  // (which has already resolved them), are passed through untouched —
  // re-resolving those too would race the label store's own state update
  // and create a duplicate, since resolveLabel can't yet see an entry it
  // created moments ago in this same synchronous call.
  const reviveIfPending = (option: LabelOption): string => {
    const existing = labelsById.get(option.id)
    if (existing?.lastRemoved !== undefined) {
      return resolveLabel({ value: option.label, colour: option.colour })
    }
    return option.id
  }

  const valueProps = isMulti
    ? {
        isMultiValue: true as const,
        value: selectedOptions,
        onChange: (value: LabelOption[]) =>
          onChange(value.map(reviveIfPending)),
      }
    : {
        value: selectedOptions[0],
        onChange: (option: LabelOption) => onChange([reviveIfPending(option)]),
      }

  return (
    <Combobox
      {...valueProps}
      label={label}
      options={options}
      createOption={createOption}
      Option={Option}
      Value={Option}
      hideSelectedOptions
      autoFocus={autoFocus}
    />
  )
}

function Option({
  value,
  children,
}: {
  value: LabelOption
  children?: ReactNode
}) {
  return (
    <div className={`label-tag ${value.colour}`}>
      {value.label} {children}
    </div>
  )
}
