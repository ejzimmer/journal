import { Button, ButtonProps } from "@chakra-ui/react"

export function TaskButton(props: Omit<ButtonProps, "as">) {
  return (
    <Button
      {...props}
      backgroundColor="transparent"
      opacity=".6"
      _hover={{ backgroundColor: "transparent", opacity: 1 }}
      _active={{ backgroundColor: "transparent", opacity: 1 }}
      transform="opacity .2s"
      height="16px"
      fontSize="16px"
    />
  )
}
