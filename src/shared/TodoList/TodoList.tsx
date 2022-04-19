import { Box, List, ListItem } from "@chakra-ui/layout"
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

const A_IS_FIRST = -1
const B_IS_FIRST = 1

const sortItems = (a: TodoItem, b: TodoItem) => {
  if (a.done && b.done) return a.position - b.position
  if (a.done) return B_IS_FIRST
  if (b.done) return A_IS_FIRST

  const aIsEveryDay = a.frequency && a.frequency.endsWith("日")
  const bIsEveryDay = b.frequency && b.frequency.endsWith("日")
  if (aIsEveryDay === bIsEveryDay) return a.position - b.position
  if (aIsEveryDay) return A_IS_FIRST

  return B_IS_FIRST
}

export function TodoList({
  id,
  items,
  onChangeItem,
  onDeleteItem,
  onReorder,
}: Props) {
  const sortedItems = [...items].sort(sortItems)

  const onDragEnd = ({ source, destination }: DropResult) => {
    // dropped outside the list
    if (!destination) {
      return
    }

    const movedItem = sortedItems[source.index]
    const listWithoutItem = sortedItems.filter(
      (_, index) => index !== source.index
    )

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
            <Total items={items} />
            {sortedItems.map((item, index) => (
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

function Total({ items }: { items: TodoItem[] }) {
  return (
    <Box
      width="40px"
      height="40px"
      margin="auto"
      transform="translateY(50%)"
      border="2px solid"
      borderRadius="50%"
      display="flex"
      alignItems="center"
      justifyContent="center"
      background="hsl(250, 30%, 80%)"
      color="hsl(25 0, 30%, 40%)"
      boxShadow="2px 2px 3px hsla(200 30% 40% / .4)"
    >
      {items.filter((item) => !item.done).length}
    </Box>
  )
}
