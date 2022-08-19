import { useCheckbox, chakra, Box } from "@chakra-ui/react"
import { PropsWithChildren, ChangeEvent } from "react"

export function BooleanTracker({
  isChecked,
  onChange,
  children,
}: PropsWithChildren<{
  isChecked: boolean
  onChange: (value: boolean) => void
}>) {
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    onChange(event.target.checked)
  }

  const { state, getInputProps, getLabelProps, htmlProps } = useCheckbox({
    isChecked,
    onChange: handleChange,
  })

  return (
    <chakra.label cursor="pointer" {...htmlProps}>
      <input {...getInputProps()} hidden />
      <Box {...getLabelProps()} opacity={state.isChecked ? 1 : 0.4}>
        {children}
      </Box>
    </chakra.label>
  )
}
