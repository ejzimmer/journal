import { Checkbox, Box } from "@chakra-ui/react"
import { ChangeEvent } from "react"
import { DeleteButton } from "../../shared/DeleteButton"
import styled from "@emotion/styled"
import { Category, COLOURS, TodoItem } from "./types"
import { isToday } from "date-fns"

interface Props {
  item: TodoItem
  onChange: (item: TodoItem) => void
  onDelete: (item: TodoItem) => void
}

export function Item({ item, onChange, onDelete }: Props) {
  const handleCheck = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      item.done = new Date().getTime()
    } else {
      delete item.done
    }

    onChange(item)
  }

  if (item.done && item.type === "毎日" && !isToday(new Date(item.done))) {
    delete item.done
    onChange(item)
  }

  const isDone = !!item.done

  return (
    <Wrapper
      checked={isDone}
      type={item.type as keyof typeof COLOURS}
      display="flex"
    >
      <label
        style={{
          display: "flex",
          alignItems: "center",
          gap: "1em",
          flexGrow: "1",
          paddingLeft: "1em",
        }}
      >
        <Checkbox
          borderColor="gray.500"
          isChecked={isDone}
          onChange={handleCheck}
        />
        {item.type} {item.description}
      </label>
      <DeleteButton
        label={`delete ${item.description}`}
        onDelete={() => onDelete(item)}
      />
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
