import { ReactNode, useContext, useMemo } from "react"
import { Colour } from "./types"
import { LabelsContext } from "./LabelsContext"
import { Combobox } from "../../shared/controls/combobox/Combobox"
import { getNextColour } from "./labelUtils"
import { Label } from "./types"

export type LabelsControlProps = {
  value: Label[]
  onChange: (value: Label[]) => void
  label: string
  hideLabel?: boolean
  isMulti?: boolean
  autoFocus?: boolean
  onCreateLabel?: (value: string) => Label
}

type LabelOption = {
  id: string
  label: string
  colour: Colour
}

export function LabelsControl({
  value,
  onChange,
  label,
  isMulti = true,
  autoFocus,
  onCreateLabel,
}: LabelsControlProps) {
  const labels = useContext(LabelsContext)
  const options: LabelOption[] = useMemo(
    () =>
      labels?.map(({ value, colour }) => ({
        id: value + colour,
        label: value,
        colour,
      })) ?? [],
    [labels],
  )

  const selectedOptions: LabelOption[] = useMemo(
    () =>
      value.map((l) => ({
        id: l.value + l.colour,
        label: l.value,
        colour: l.colour,
      })),
    [value],
  )

  const createOption = (text: string): LabelOption => {
    if (onCreateLabel) {
      const created = onCreateLabel(text)
      return {
        id: created.value + created.colour,
        label: created.value,
        colour: created.colour,
      }
    }

    const colour = getNextColour(
      [...options, ...value].map((label) => label.colour),
    )
    return {
      id: text + colour,
      label: text,
      colour,
    }
  }

  const valueProps = isMulti
    ? {
        isMultiValue: true as const,
        value: selectedOptions,
        onChange: (value: LabelOption[]) =>
          onChange(value.map((o) => ({ value: o.label, colour: o.colour }))),
      }
    : {
        value: selectedOptions[0],
        onChange: (option: LabelOption) =>
          onChange([{ value: option.label, colour: option.colour }]),
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
