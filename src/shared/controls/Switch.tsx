import { useEffect, useRef, useState } from "react"

import "./Switch.css"

type SwitchProps<T extends string> = {
  options: T[]
  value: T
  onChange: (value: T) => void
}

export function Switch<T extends string>({
  options,
  value,
  onChange,
}: SwitchProps<T>) {
  const radioGroupRef = useRef<HTMLDivElement>(null)
  const [width, setWidth] = useState<number>()
  const [left, setLeft] = useState<number>()

  useEffect(() => {
    if (!radioGroupRef.current) {
      return
    }
    const checkedOption = radioGroupRef.current.querySelector(
      `input[value="${value}"]`
    )
    if (!checkedOption) {
      return
    }
    const checkedOptionLabel = checkedOption.closest("label")
    if (!checkedOptionLabel) {
      return
    }

    setWidth(checkedOptionLabel.clientWidth)
    const labelLeft = checkedOptionLabel.getBoundingClientRect().left ?? 0
    const parentLeft = radioGroupRef.current.getBoundingClientRect().left ?? 0
    setLeft(labelLeft - parentLeft - 1)
  }, [value])

  const borderRadiusLeft = value === options[0] ? "inherit" : undefined
  const borderRadiusRight =
    value === options[options.length - 1] ? "inherit" : undefined

  return (
    <div ref={radioGroupRef} role="radiogroup" className="switch">
      {options.map((option) => (
        <label key={option}>
          {option}
          <input
            type="radio"
            value={option}
            name="switch-option"
            checked={value === option}
            onChange={() => onChange(option)}
          />
        </label>
      ))}
      <div
        className="indicator"
        style={{
          width,
          left,
          borderTopLeftRadius: borderRadiusLeft,
          borderTopRightRadius: borderRadiusRight,
          borderBottomLeftRadius: borderRadiusLeft,
          borderBottomRightRadius: borderRadiusRight,
        }}
      />
    </div>
  )
}
