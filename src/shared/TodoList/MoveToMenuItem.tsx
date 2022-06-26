import { MenuItem } from "@chakra-ui/react"

type Props = {
  target: string
}

export function MoveToMenuItem({ target }: Props) {
  return <MenuItem>Move to {target}</MenuItem>
}
