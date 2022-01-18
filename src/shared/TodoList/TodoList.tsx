import { List, ListItem } from "@chakra-ui/layout"
import {
  DragDropContext,
  Draggable,
  Droppable,
  DropResult,
} from "react-beautiful-dnd"
import { Item } from "./Item"
import { TodoItem } from "./types"

interface Props {
  id: string
  items: TodoItem[]
  onChange: (items: TodoItem[]) => void
}

const sortByDone = (a: TodoItem, b: TodoItem) =>
  a.done === b.done ? 0 : a.done ? 1 : -1

export function TodoList({ id, items, onChange }: Props) {
  const onDragEnd = ({ source, destination }: DropResult) => {
    // dropped outside the list
    if (!destination) {
      return
    }

    const [removed] = items.splice(source.index, 1)
    const listStart = items.slice(0, destination.index)
    const listEnd = items.slice(destination.index)

    onChange([...listStart, removed, ...listEnd])
  }

  const onChangeItem = (item: TodoItem) => {
    const index = items.findIndex((i) => item.description === i.description)
    const startOfList = items.slice(0, index)
    const endOfList = items.slice(index + 1)

    const updatedItems = [...startOfList, item, ...endOfList].sort(sortByDone)

    onChange(updatedItems)
  }

  const onDeleteItem = ({ description }: TodoItem) => {
    const updatedItems = items.filter((i) => i.description !== description)
    onChange(updatedItems)
  }

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Droppable droppableId={id}>
        {(provided) => (
          <List
            listStyleType="none"
            width="100%"
            maxWidth="400px"
            {...provided.droppableProps}
            ref={provided.innerRef}
          >
            {items.sort(sortByDone).map((item, index) => (
              <Draggable
                key={item.id || item.description}
                draggableId={item.id || item.description}
                index={index}
              >
                {(provided) => (
                  <ListItem
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                  >
                    <Item
                      item={item}
                      onChange={onChangeItem}
                      onDelete={onDeleteItem}
                    />
                  </ListItem>
                )}
              </Draggable>
            ))}
          </List>
        )}
      </Droppable>
    </DragDropContext>
  )
}
