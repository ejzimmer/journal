import { Box } from "@chakra-ui/layout"
import { DeleteButton } from "../../shared/DeleteButton"
import { ItemRecord } from "./types"

interface Props {
  item: ItemRecord
  onDelete: (item: ItemRecord) => void
}

export function Item({ item, onDelete }: Props) {
  return (
    <Box>
      {item.type} {item.description}{" "}
      <DeleteButton
        label={`delete ${item.description}`}
        onDelete={() => onDelete(item)}
      />
    </Box>
  )
}
