import { useEffect, useState } from "react"
import { Item } from "./Item"
import { NewItem } from "./NewItem"
import { ItemRecord } from "./types"
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "react-beautiful-dnd"
import { List, ListItem } from "@chakra-ui/react"

const LOCAL_STORAGE_KEY = "todo"

export function Todo() {
  const [items, setItems] = useState<ItemRecord[]>([])

  useEffect(() => {
    const items = localStorage.getItem(LOCAL_STORAGE_KEY)
    if (items) {
      setItems(JSON.parse(items))
    }
  }, [])

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(items))
  }, [items])

  const addItem = (item: ItemRecord) => {
    setItems((items) => [...items, item])
  }

  const onDragEnd = ({ source, destination }: DropResult) => {
    // dropped outside the list
    if (!destination) {
      return
    }

    setItems((items) => reorder(items, source.index, destination.index))
  }

  const onChange = (item: ItemRecord) => {
    setItems((items) => {
      const index = items.findIndex((i) => item.description === i.description)
      const startOfList = items.slice(0, index)
      const endOfList = items.slice(index + 1)

      return [...startOfList, item, ...endOfList].sort((a, b) =>
        a.checked === b.checked ? 0 : a.checked ? 1 : -1
      )
    })
  }

  const onDelete = ({ description }: ItemRecord) => {
    setItems((items) => items.filter((i) => i.description !== description))
  }

  return (
    <>
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="todo">
          {(provided) => (
            <List
              listStyleType="none"
              maxWidth="400px"
              {...provided.droppableProps}
              ref={provided.innerRef}
            >
              {items.map((item, index) => (
                <Draggable
                  key={item.description}
                  draggableId={item.description}
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
                        onChange={onChange}
                        onDelete={onDelete}
                      />
                    </ListItem>
                  )}
                </Draggable>
              ))}
            </List>
          )}
        </Droppable>
      </DragDropContext>
      <NewItem addItem={addItem} />
    </>
  )
}

const reorder = (list: ItemRecord[], startIndex: number, endIndex: number) => {
  const [removed] = list.splice(startIndex, 1)
  const listStart = list.slice(0, endIndex)
  const listEnd = list.slice(endIndex)

  return [...listStart, removed, ...listEnd]
}
