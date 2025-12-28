import { useContext } from "react"
import { TodoItem } from "./types"
import { Menu } from "../../../shared/controls/Menu"
import { FirebaseContext } from "../../../shared/FirebaseContext"

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
