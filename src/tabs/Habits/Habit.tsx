import { Checkbox } from "@chakra-ui/checkbox"
import { Td, Th, Tr } from "@chakra-ui/table"
import { format, isSameDay } from "date-fns"
import { HabitRecord } from "./types"
import { DeleteButton } from "../../shared/DeleteButton"

interface Props {
  habit: HabitRecord
  days: Date[]
  onChange: (habit: HabitRecord) => void
  onDelete: (habit: HabitRecord) => void
}

export function Habit({ habit, days, onChange, onDelete }: Props) {
  const updateDays = (day: Date) => {
    if (listIncludesDay(habit.days, day)) {
      const days = habit.days.filter((d) => !isSameDay(day, d))
      onChange({ ...habit, days })
    } else {
      const days = [...habit.days, day].sort()
      onChange({ ...habit, days })
    }
  }

  return (
    <Tr>
      <Th>{habit.name}</Th>
      {days.map((day) => (
        <Td key={formatDate(day)} textAlign="center" p="0">
          <Checkbox
            onChange={() => updateDays(day)}
            data-aria-label={`${habit.name} ${formatDate(day)}`}
            isChecked={listIncludesDay(habit.days, day)}
          />
        </Td>
      ))}
      <Td>
        <DeleteButton
          label={`delete ${habit.name}`}
          onDelete={() => onDelete(habit)}
        />
      </Td>
    </Tr>
  )
}

const formatDate = (date: Date) => format(date, "yyyy-MM-dd")
const listIncludesDay = (list: Date[], day: Date) =>
  list.some((d) => isSameDay(d, day))
