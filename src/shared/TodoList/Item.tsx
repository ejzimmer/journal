import { Checkbox, Box, Menu, IconButton } from "@chakra-ui/react"
import { ChangeEvent } from "react"
import { DeleteMenuItem } from "../DeleteMenuItem"
import { Category, COLOURS, TodoItem } from "./types"
import { isToday } from "date-fns"
import { SlArrowDown } from "react-icons/sl"
import { MoveToMenuItem } from "./MoveToMenuItem"

interface Props {
  item: TodoItem
  currentList?: string
  otherLists?: string[]
  onChange: (item: TodoItem) => void
  onDelete: (item: TodoItem) => void
  onMoveToTop: () => void
}

export function Item({
  item,
  otherLists = [],
  currentList,
  onChange,
  onDelete,
  onMoveToTop,
}: Props) {
  const handleCheck = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      item.done = new Date().getTime()
    } else {
      delete item.done
    }

    onChange(item)
  }

  if (item.done && item.frequency === "毎日" && !isToday(new Date(item.done))) {
    delete item.done
    onChange(item)
  }

  const isDone = !!item.done

  return (
    <Wrapper
      checked={isDone}
      type={item.type as keyof typeof COLOURS}
      display="flex"
      cursor="pointer"
      _hover={{
        outline: "1px solid #999",
      }}
    >
      <label
        style={{
          display: "flex",
          alignItems: "center",
          gap: "1em",
          flexGrow: "1",
          paddingLeft: "1em",
          cursor: "pointer",
        }}
      >
        <Checkbox.Root
          variant="subtle"
          color="gray"
          isChecked={isDone}
          onChange={handleCheck}
        >
          <Checkbox.Control />
        </Checkbox.Root>
        {item.type} {item.description}
      </label>
      {!isDone && (
        <Menu.Root>
          <Menu.Trigger asChild>
            <IconButton variant="ghost" borderRadius="0" aria-label="actions">
              <SlArrowDown />
            </IconButton>
          </Menu.Trigger>
          <Menu.Content>
            <Menu.Item value="top" onSelect={onMoveToTop}>
              ⏫ Move to top
            </Menu.Item>
            {currentList &&
              otherLists.map((list) => (
                <MoveToMenuItem
                  key={list}
                  source={currentList}
                  target={list}
                  item={item}
                />
              ))}
            <DeleteMenuItem onDelete={() => onDelete(item)} />
          </Menu.Content>
        </Menu.Root>
      )}
    </Wrapper>
  )
}

interface WrapperProps {
  checked?: boolean
  type: Category
  children: React.ReactNode
}

const checkedStyles = {
  color: "grey",
  opacity: 0.5,
  textDecoration: "line-through",
}
function Wrapper({ checked, type, children }: WrapperProps) {
  const uncheckedStyles = { backgroundColour: COLOURS[type] }
  return checked ? (
    <Box {...checkedStyles}>{children}</Box>
  ) : (
    <Box {...uncheckedStyles}>{children}</Box>
  )
}
