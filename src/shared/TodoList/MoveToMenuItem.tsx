import { MenuItem } from "@chakra-ui/react"
import { useContext } from "react"
import { FirebaseContext } from "../FirebaseContext"
import { TodoItem } from "./types"

type Props = {
  target: string
  item: TodoItem
}

export function MoveToMenuItem({ target, item }: Props) {
  const { addItemToList } = useContext(FirebaseContext)

  const onClick = () => {
    addItemToList(target, item)
  }

  return <MenuItem onClick={onClick}>Move to {target}</MenuItem>
}
