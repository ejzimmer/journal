import {
  Checkbox,
  Box,
  Button,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
} from "@chakra-ui/react"
import { ChangeEvent } from "react"
import { DeleteMenuItem } from "../DeleteMenuItem"
import styled from "@emotion/styled"
import { Category, COLOURS, TodoItem } from "./types"
import { isToday } from "date-fns"
import { ChevronDownIcon } from "@chakra-ui/icons"
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
        <Checkbox
          borderColor="gray.500"
          isChecked={isDone}
          onChange={handleCheck}
        />
        {item.type} {item.description}
      </label>
      {!isDone && (
        <Menu>
          <MenuButton
            as={Button}
            variant="ghost"
            borderRadius="0"
            aria-label="actions"
            rightIcon={<ChevronDownIcon />}
          />
          <MenuList>
            <MenuItem onClick={onMoveToTop}>⏫ Move to top</MenuItem>
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
          </MenuList>
        </Menu>
      )}
    </Wrapper>
  )
}

interface WrapperProps {
  checked?: boolean
  type: Category
}

const Wrapper = styled(Box)`
  ${({ checked, type }: WrapperProps) =>
    checked
      ? "color: grey; opacity: .5; text-decoration: line-through"
      : `background-color: ${COLOURS[type]}`}
`
