import { Button, ButtonProps } from "@chakra-ui/react"
import { forwardRef } from "react"

export const TaskButton = forwardRef<
  HTMLButtonElement,
  Omit<ButtonProps, "as">
>((props, ref) => {
  return (
    <Button
      {...props}
      ref={ref}
      backgroundColor="transparent"
      opacity=".6"
      _hover={{ backgroundColor: "transparent", opacity: 1 }}
      _active={{ backgroundColor: "transparent", opacity: 1 }}
      transform="opacity .2s"
      height="16px"
      fontSize="16px"
    />
  )
})
