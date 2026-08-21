import { ReactNode, useMemo } from "react"
import { COLOURS, Colour, Label } from "./types"
import { Combobox } from "../../shared/controls/combobox/Combobox"
import { useWorkStorage } from "./WorkStorageContext"

export type LabelsControlProps = {
  value: Label[]
  onChange: (value: Label[]) => void
  label: string
  hideLabel?: boolean
  isMulti?: boolean
  autoFocus?: boolean
}

// A label's value is unique within the store, so it doubles as a stable
// local id for the combobox — no need to know a label's real (or not yet
// created) database id just to display and pick from a list of them.
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

const toOption = ({ value, colour }: Label): LabelOption => ({
  id: value,
  label: value,
  colour,
})
const toLabel = (option: LabelOption): Label => ({
  value: option.label,
  colour: option.colour,
})

export function LabelsControl({
  value,
  onChange,
  label,
  isMulti = true,
  autoFocus,
}: LabelsControlProps) {
  const { labels } = useWorkStorage()

  const options: LabelOption[] = useMemo(() => labels.map(toOption), [labels])
  const selectedOptions: LabelOption[] = useMemo(
    () => value.map(toOption),
    [value],
  )

  const createOption = (text: string): LabelOption => ({
    id: text,
    label: text,
    colour: getNextColour(options.map((option) => option.colour)),
  })

  const valueProps = isMulti
    ? {
        isMultiValue: true as const,
        value: selectedOptions,
        onChange: (value: LabelOption[]) => onChange(value.map(toLabel)),
      }
    : {
        value: selectedOptions[0],
        onChange: (option: LabelOption) => onChange([toLabel(option)]),
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
