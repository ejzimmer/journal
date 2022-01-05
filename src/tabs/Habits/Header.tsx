import { Th, Thead, Tr } from "@chakra-ui/table"
import { format } from "date-fns"

const formatDate = (date: Date) => format(date, "dd/MM")

interface Props {
  days: Date[]
}

export function Header({ days }: Props) {
  return (
    <Thead>
      <Tr borderBottomWidth="1px">
        <Th />
        {days.map((day) => (
          <Th key={formatDate(day)} fontSize="10px" px="0" textAlign="center">
            {formatDate(day)}
          </Th>
        ))}
      </Tr>
    </Thead>
  )
}
