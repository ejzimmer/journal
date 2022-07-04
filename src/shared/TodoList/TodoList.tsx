import { Box, Flex, List, ListItem } from "@chakra-ui/layout"
import { FormLabel } from "@chakra-ui/react"
import { Fragment, useEffect, useMemo, useState } from "react"
import {
  DragDropContext,
  Draggable,
  Droppable,
  DropResult,
} from "react-beautiful-dnd"
import { resortList, sortItems } from "../utilities"
import { Item } from "./Item"
import { TodoItem, Category, COLOURS } from "./types"

interface Props {
  id: string
  items: TodoItem[]
  onChangeItem: (item: TodoItem) => void
  onDeleteItem: (item: TodoItem) => void
  onReorder: (items: TodoItem[]) => void
  currentList?: string
  otherLists?: string[]
}

export function TodoList({
  id,
  items,
  onChangeItem,
  onDeleteItem,
  onReorder,
  currentList,
  otherLists,
}: Props) {
  const sortedItems = useMemo(() => [...items].sort(sortItems), [items])
  const [filteredItems, setFilteredItems] = useState(sortedItems)

  const onDragEnd = (dropResult: DropResult) => {
    resortList(dropResult, sortedItems, onReorder)
  }

  const onMoveToTop = (sourceIndex: number) => {
    const opts = {
      source: {
        index: sourceIndex,
      },
      destination: {
        index: 0,
      },
    }
    resortList(opts, sortedItems, onReorder)
  }

  return (
    <Box>
      <Flex
        width="100%"
        border="2px solid hsl(0 0% 85%)"
        borderTopRadius="lg"
        alignItems="center"
        justifyContent="space-around"
      >
        <Total items={items} />
        <FilterByCategory
          id={id}
          items={sortedItems}
          setItems={setFilteredItems}
        />
      </Flex>
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId={id}>
          {(provided) => (
            <List
              listStyleType="none"
              width="100%"
              minWidth="400px"
              {...provided.droppableProps}
              ref={provided.innerRef}
            >
              {filteredItems.map((item, index) => (
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
                        currentList={currentList}
                        otherLists={otherLists}
                        onChange={onChangeItem}
                        onDelete={onDeleteItem}
                        onMoveToTop={() => onMoveToTop(index)}
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
    </Box>
  )
}

function Total({ items }: { items: TodoItem[] }) {
  return (
    <Box
      flexGrow="1"
      flexBasis="1.5em"
      flexShrink="0"
      textAlign="center"
      fontWeight="bold"
      color="#666"
    >
      {items.filter((item) => !item.done).length}
    </Box>
  )
}

type FilterProps = {
  items: TodoItem[]
  setItems: (items: TodoItem[]) => void
  id: string
}
type Filter = Record<Category, boolean>

function FilterByCategory({ items, setItems, id }: FilterProps) {
  const [filters, setFilters] = useState<Filter>(
    Object.keys(COLOURS).reduce(
      (filters, category) => ({ ...filters, [category]: false }),
      {}
    ) as Filter
  )

  const updateFilters = (category: string, turnOn: boolean) => {
    setFilters((filters) => ({ ...filters, [category]: turnOn }))
  }

  useEffect(() => {
    const filterList = Object.entries(filters)
      .filter(([_, isOn]) => isOn)
      .map(([category]) => category)

    if (filterList.length > 0) {
      const filteredItems = [...items].filter((item) =>
        filterList.includes(item.type)
      )

      setItems(filteredItems)
    } else {
      setItems(items)
    }
  }, [filters, setItems, items])

  return (
    <Flex
      sx={{
        'input[type="checkbox"]:checked + label': {
          background: "currentColor",
        },
      }}
      alignItems="center"
      justifyContent="space-between"
      flexGrow="1"
    >
      {[...Object.entries(COLOURS)].map(([category, colour]) => (
        <Fragment key={category}>
          <input
            type="checkbox"
            id={`${id}-${category}`}
            style={{
              width: 0,
              opacity: 0,
              padding: 0,
              position: "fixed",
              top: "-100%",
            }}
            checked={filters[category as Category]}
            onChange={(event) =>
              updateFilters(
                category,
                (event.target as HTMLInputElement).checked
              )
            }
          />
          <FormLabel
            htmlFor={`${id}-${category}`}
            cursor="pointer"
            margin="0"
            padding="2"
            color={colour}
            _hover={{
              background: "currentColor",
            }}
            flexGrow="1"
            textAlign="center"
          >
            {category}
          </FormLabel>
        </Fragment>
      ))}
    </Flex>
  )
}
