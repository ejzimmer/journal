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
  onChangeItem: (item: TodoItem) => void
  onDeleteItem: (item: TodoItem) => void
  onReorder: (items: TodoItem[]) => void
}

const sortItems = (a: TodoItem, b: TodoItem) => {
  if (a.done === b.done) return a.position - b.position
  if (a.done) return -1
  return 1
}

export function TodoList({
  id,
  items,
  onChangeItem,
  onDeleteItem,
  onReorder,
}: Props) {
  const onDragEnd = ({ source, destination }: DropResult) => {
    // dropped outside the list
    if (!destination) {
      return
    }

    const movedItem = items[source.index]
    const listWithoutItem = items.filter((_, index) => index !== source.index)

    const listStart = listWithoutItem.slice(0, destination.index)
    const listEnd = listWithoutItem.slice(destination.index)

    const reshuffledList = [...listStart, movedItem, ...listEnd].map(
      (item, index) => ({ ...item, position: index })
    )

    onReorder(reshuffledList)
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
            {items.sort(sortItems).map((item, index) => (
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
            {provided.placeholder}
          </List>
        )}
      </Droppable>
    </DragDropContext>
  )
}
