import { ReactNode, useContext, useMemo } from "react"
import { Label, COLOURS, Colour } from "../../shared/types"
import { LabelsContext } from "./LabelsContext"
import { Combobox } from "../../shared/controls/combobox/Combobox"

export type LabelsControlProps = {
  value: Label[]
  onChange: (value: Label[]) => void
  label: string
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

  const usageCount = colours.reduce((usages, colour) => {
    usages[colour] = (usages[colour] ?? 0) + 1
    return usages
  }, {} as Record<(typeof COLOURS)[number], number>)
  const lowestUsage = Math.min(...Object.values(usageCount))
  const lowestUsageColour = Object.entries(usageCount).find(
    ([, count]) => count === lowestUsage
  )?.[0]

  return isColour(lowestUsageColour) ? lowestUsageColour : COLOURS[0]
}

export function LabelsControl({ value, onChange, label }: LabelsControlProps) {
  const labels = useContext(LabelsContext)
  const options: LabelOption[] = useMemo(
    () =>
      labels?.map(({ value, colour }) => ({
        id: value + colour,
        label: value,
        colour,
      })) ?? [],
    [labels]
  )

  const selectedOptions: LabelOption[] = useMemo(
    () =>
      value.map((l) => ({
        id: l.value + l.colour,
        label: l.value,
        colour: l.colour,
      })),
    [value]
  )

  const createOption = (text: string): LabelOption => {
    const colour = getNextColour(
      [...options, ...value].map((label) => label.colour)
    )
    return {
      id: text + colour,
      label: text,
      colour,
    }
  }

  const handleChange = (value: LabelOption[]) => {
    onChange(value.map((o) => ({ value: o.label, colour: o.colour })))
  }

  return (
    <Combobox
      value={selectedOptions}
      onChange={handleChange}
      label={label}
      options={options}
      createOption={createOption}
      Option={Option}
      Value={Option}
      isMultiValue
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
