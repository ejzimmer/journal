import { Square, chakra, useCheckbox } from "@chakra-ui/react"
import { ChangeEvent } from "react"

type Props = {
  label: string
  isChecked: boolean
  onChange: (event: ChangeEvent<HTMLInputElement>) => void
}

export function Checkbox({ label, isChecked, onChange }: Props) {
  const { htmlProps, getInputProps, state, getCheckboxProps } = useCheckbox({
    isChecked,
    onChange,
  })

  return (
    <chakra.label height="100%" style={{ aspectRatio: "1" }} {...htmlProps}>
      <input {...getInputProps()} aria-label={label} />
      <Square
        size="calc(var(--input-height) * .9)"
        backgroundColor="hsl(0 0% 100%/.7)"
        borderRadius="6px"
        {...getCheckboxProps}
      >
        {state.isChecked && (
          <svg viewBox="0 0 100 100">
            <path
              d="M10,60 L38 85, 85 20"
              stroke="hsl(0 0% 20%)"
              strokeWidth="10"
              strokeLinecap="round"
              fill="none"
            />
          </svg>
        )}
      </Square>
    </chakra.label>
  )
}
