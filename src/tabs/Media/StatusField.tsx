import { ReactElement, useId } from "react"
import { EmojiRadio } from "../../shared/controls/EmojiRadio"

import "./StatusField.css"

export type StatusOption<T extends string> = {
  value: T
  emoji: string | ReactElement
  label: string
}

type StatusFieldProps<T extends string> = {
  legend: string
  options: StatusOption<T>[]
  value: T
  onChange: (value: T) => void
}

export function StatusField<T extends string>({
  legend,
  options,
  value,
  onChange,
}: StatusFieldProps<T>) {
  const name = useId()

  return (
    <fieldset className="status-field">
      <legend>{legend}</legend>
      <div className="options">
        {options.map((option) => (
          <EmojiRadio
            key={option.value}
            name={name}
            value={option.value}
            emoji={option.emoji}
            label={option.label}
            isChecked={value === option.value}
            onChange={() => onChange(option.value)}
          />
        ))}
      </div>
    </fieldset>
  )
}
