import { Box, Flex, List, ListItem } from "@chakra-ui/layout"
import { FormLabel, Input } from "@chakra-ui/react"
import { useState } from "react"
import {
  DragDropContext,
  Draggable,
  Droppable,
  DropResult,
} from "react-beautiful-dnd"
import { resortList } from "../utilities"
import { Item } from "./Item"
import { TodoItem, CATEGORIES } from "./types"

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
  const [filteredItems, setFilteredItems] = useState(items)

  const onDragEnd = (dropResult: DropResult) => {
    resortList(dropResult, sortedItems, onReorder)
  }

  return (
    <>
      <Total items={items} />
      <FilterByCategory items={items} setItems={setFilteredItems} />
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
    </>
  )
}

function Total({ items }: { items: TodoItem[] }) {
  return (
    <Box
      width="40px"
      height="40px"
      margin="auto"
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

type FilterProps = {
  items: TodoItem[]
  setItems: (items: TodoItem[]) => void
}

function FilterByCategory({ items, setItems }: FilterProps) {
  return (
    <Flex
      sx={{ 'input[type="checkbox"]:checked + label': { background: "green" } }}
      alignItems="center"
    >
      {CATEGORIES.map((category) => (
        <>
          <Input
            type="checkbox"
            value={category}
            id={category}
            width="0"
            opacity="0"
            padding="0"
          />
          <FormLabel htmlFor={category} cursor="pointer" margin="0" padding="2">
            {category}
          </FormLabel>
        </>
      ))}
    </Flex>
  )
}
