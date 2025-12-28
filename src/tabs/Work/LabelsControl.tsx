import { ReactNode, useContext, useMemo } from "react"
import { Label, COLOURS, Colour } from "../../shared/types"
import { LabelsContext } from "./LabelsContext"
import { Combobox } from "../../shared/controls/combobox/Combobox"

export type LabelsControlProps = {
  value: Label[]
  onChange: (value: Label[]) => void
  label: string
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
  const options = useMemo(
    () => labels?.map((l) => ({ text: l.value, colour: l.colour })) ?? [],
    [labels]
  )

  const valueOptions = useMemo(
    () => value.map((l) => ({ text: l.value, colour: l.colour })),
    [value]
  )

  const createOption = (text: string) => {
    return {
      text,
      colour: getNextColour(
        [...options, ...value].map((label) => label.colour)
      ),
    }
  }

  const handleChange = (value: { text: string; colour: Label["colour"] }[]) => {
    onChange(value.map((o) => ({ value: o.text, colour: o.colour })))
  }

  return (
    <Combobox
      value={valueOptions}
      onChange={handleChange}
      label={label}
      options={options}
      createOption={createOption}
      Option={Option}
      allowMulti
    />
  )
}

function Option({
  option,
  children,
}: {
  option: { text: string; colour: (typeof COLOURS)[number] }
  children?: ReactNode
}) {
  return (
    <div className={`label-tag ${option.colour}`}>
      {option.text}
      {children}
    </div>
  )
}
