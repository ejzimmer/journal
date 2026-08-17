import { ReactNode, useContext, useEffect, useMemo } from "react"
import { subDays } from "date-fns"
import { COLOURS, Colour, Label, LABELS_KEY } from "./types"
import { LabelsContext } from "./LabelsContext"
import { FirebaseContext } from "../../shared/FirebaseContext"
import { Combobox } from "../../shared/controls/combobox/Combobox"

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

const STALE_AFTER_DAYS = 7

export function LabelsControl({
  value,
  onChange,
  label,
  isMulti = true,
  autoFocus,
}: LabelsControlProps) {
  const labels = useContext(LabelsContext)
  const storageContext = useContext(FirebaseContext)
  if (!storageContext) {
    throw new Error("missing storage context")
  }
  const { addItem, deleteItem } = storageContext

  useEffect(() => {
    const staleBefore = subDays(new Date(), STALE_AFTER_DAYS).getTime()
    labels?.forEach((storedLabel) => {
      if (storedLabel.lastRemoved && storedLabel.lastRemoved < staleBefore) {
        deleteItem(LABELS_KEY, storedLabel)
      }
    })
  }, [labels, deleteItem])

  const labelsById = useMemo(
    () => new Map(labels?.map((l) => [l.id, l] as const)),
    [labels],
  )

  const options: LabelOption[] = useMemo(
    () =>
      labels?.map(({ id, value, colour }) => ({
        id,
        label: value,
        colour,
      })) ?? [],
    [labels],
  )

  const selectedOptions: LabelOption[] = useMemo(
    () =>
      value
        .map((id) => labelsById.get(id))
        .filter((l): l is Label => !!l)
        .map((l) => ({ id: l.id, label: l.value, colour: l.colour })),
    [value, labelsById],
  )

  const createOption = (text: string): LabelOption => {
    const colour = getNextColour(
      [...options, ...selectedOptions].map((option) => option.colour),
    )
    const id = addItem<Label>(LABELS_KEY, { value: text, colour })
    return {
      id: id ?? text,
      label: text,
      colour,
    }
  }

  const valueProps = isMulti
    ? {
        isMultiValue: true as const,
        value: selectedOptions,
        onChange: (value: LabelOption[]) => onChange(value.map((o) => o.id)),
      }
    : {
        value: selectedOptions[0],
        onChange: (option: LabelOption) => onChange([option.id]),
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
