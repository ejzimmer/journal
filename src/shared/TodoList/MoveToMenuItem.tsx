import { MenuItem } from "@chakra-ui/react"
import { useContext } from "react"
import { FirebaseContext } from "../FirebaseContext"
import { TodoItem } from "./types"

type Props = {
  source: string
  target: string
  item: TodoItem
}

export function MoveToMenuItem({ source, target, item }: Props) {
  const { addItemToList, deleteItemFromList } = useContext(FirebaseContext)

  const onClick = () => {
    addItemToList(target, item)
    deleteItemFromList(source, item)
  }

  return <MenuItem onClick={onClick}>↔️ Move to {target}</MenuItem>
}
