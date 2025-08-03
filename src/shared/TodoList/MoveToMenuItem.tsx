import { useContext } from "react"
import { FirebaseContext } from "../FirebaseContext"
import { TodoItem } from "./types"
import { Menu } from "../controls/Menu"

type Props = {
  source: string
  target: string
  item: TodoItem
}

export function MoveToMenuItem({ source, target, item }: Props) {
  const context = useContext(FirebaseContext)
  if (!context) {
    throw new Error("missing context")
  }
  const { addItem: addItemToList, deleteItem: deleteItemFromList } = context

  const onClick = () => {
    addItemToList(target, item)
    deleteItemFromList(source, item)
  }

  return <Menu.Action onClick={onClick}>↔️ Move to {target}</Menu.Action>
}
