import { Box, VisuallyHidden, FormLabel } from "@chakra-ui/react"
import { ChangeEventHandler } from "react"

type Props = {
  name: string
  options: string[]
  value: string
  onChange: (value: string) => void
}

export function MultistateTracker({ name, options, value, onChange }: Props) {
  return (
    <Box
      as="fieldset"
      __css={{
        label: { display: "none" },
        "input:checked + label": { display: "revert" },
      }}
    >
      {options.map((option, index) => (
        <MultiStateCheckbox
          key={option}
          htmlFor={options[(index + 1) % options.length]}
          isChecked={value === option}
          name={name}
          onChange={(event) => {
            onChange(event.target.value)
          }}
          value={option}
        />
      ))}
    </Box>
  )
}

function MultiStateCheckbox({
  name,
  value,
  isChecked,
  onChange,
  htmlFor,
}: {
  name: string
  value: string
  isChecked: boolean
  onChange: ChangeEventHandler<HTMLInputElement>
  htmlFor: string
}) {
  return (
    <>
      <VisuallyHidden
        as="input"
        type="radio"
        id={`${name}-${value}`}
        name={name}
        value={value}
        checked={isChecked}
        onChange={onChange}
      />
      <FormLabel cursor="pointer" htmlFor={`${name}-${htmlFor}`}>
        {value}
      </FormLabel>
    </>
  )
}
