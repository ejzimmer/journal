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

const sortByDone = (a: TodoItem, b: TodoItem) =>
  a.done === b.done ? 0 : a.done ? 1 : -1

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

    const list = [...items]

    const [removed] = list.splice(source.index, 1)
    const listStart = list.slice(0, destination.index)
    const listEnd = list.slice(destination.index)

    onReorder([...listStart, removed, ...listEnd])
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
            {provided.placeholder}
          </List>
        )}
      </Droppable>
    </DragDropContext>
  )
}
