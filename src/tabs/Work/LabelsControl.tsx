import { ReactNode, useContext, useMemo } from "react"
import { Label, COLOURS } from "../../shared/TaskList/types"
import { LabelsContext } from "./LabelsContext"
import { Combobox } from "../../shared/controls/combobox/Combobox"

export type LabelsControlProps = {
  value: Label[]
  onChange: (value: Label[]) => void
  label: string
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
    const totalOptions = new Set([
      ...options.map((o) => o.text),
      ...value.map((o) => o.value),
    ]).size
    return {
      text,
      colour: COLOURS[totalOptions % COLOURS.length],
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
    <div className={`label ${option.colour}`}>
      {option.text}
      {children}
    </div>
  )
}
