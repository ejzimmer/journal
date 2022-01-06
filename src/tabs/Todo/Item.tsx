import { Checkbox, Box } from "@chakra-ui/react"
import { ChangeEvent } from "react"
import { DeleteButton } from "../../shared/DeleteButton"
import { ItemRecord } from "./types"
import styled from "@emotion/styled"

interface Props {
  item: ItemRecord
  onChange: (item: ItemRecord) => void
  onDelete: (item: ItemRecord) => void
}

export function Item({ item, onChange, onDelete }: Props) {
  const handleCheck = (event: ChangeEvent<HTMLInputElement>) => {
    item.checked = event.target.checked
    onChange(item)
  }

  return (
    <Wrapper checked={item.checked} display="flex">
      <label
        style={{
          display: "flex",
          alignItems: "center",
          gap: "1em",
          flexGrow: "1",
        }}
      >
        <Checkbox isChecked={item.checked} onChange={handleCheck} />
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
}

const Wrapper = styled(Box)`
  ${({ checked }: WrapperProps) =>
    checked ? "color: grey; opacity: .5; text-decoration: line-through" : ""}
`
