import { Checkbox, Box } from "@chakra-ui/react"
import { ChangeEvent } from "react"
import { DeleteButton } from "../../shared/DeleteButton"
import styled from "@emotion/styled"
import { TodoItem } from "./types"
import { isToday } from "date-fns"

interface Props {
  item: TodoItem
  onChange: (item: TodoItem) => void
  onDelete: (item: TodoItem) => void
}

export function Item({ item, onChange, onDelete }: Props) {
  const handleCheck = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      item.done = new Date()
    } else {
      item.done = undefined
    }

    onChange(item)
  }

  if (item.done && !isToday(new Date(item.done))) {
    delete item.done
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

const COLOURS = {
  "🧹": "hsl(180 20% 90%)",
  "⚒️": "hsl(340 90% 90%)",
  "💰": "hsl(120 70% 85%)",
  "🪡": "hsl(250 50% 90%)",
  "🧶": "hsl(80 50% 90%)",
  "🖌️": "hsl(30 50% 90%)",
  "📓": "hsl(60 50% 90%)",
  "👾": "hsl(300 50% 90%)",
  "🖋️": "hsl(50 50% 90%)",
  "👩‍💻": "hsl(160 50% 90%)",
}

interface WrapperProps {
  checked?: boolean
  type: keyof typeof COLOURS
}

const Wrapper = styled(Box)`
  ${({ checked, type }: WrapperProps) =>
    checked
      ? "color: grey; opacity: .5; text-decoration: line-through"
      : `background-color: ${COLOURS[type]}`}
`
