import { Checkbox } from "@chakra-ui/checkbox"
import { Td, Th, Tr } from "@chakra-ui/table"
import { format, isSameDay } from "date-fns"
import { HabitRecord } from "./types"
import { DeleteButton } from "../../shared/DeleteButton"
import { ChangeEvent } from "react"

interface Props {
  habit: HabitRecord
  days: Date[]
  onChange: (habit: HabitRecord) => void
  onDelete: (habit: HabitRecord) => void
}

export function Habit({ habit, days, onChange, onDelete }: Props) {
  const updateDays = (event: ChangeEvent<HTMLInputElement>) => {
    const { checked: isChecked, value } = event.target
    const day = Number.parseInt(value)
    const days = habit.days || []

    if (isChecked) {
      onChange({ ...habit, days: [...days, day].sort() })
    } else {
      onChange({ ...habit, days: days.filter((d) => !isSameDay(d, day)) })
    }
  }

  return (
    <Tr>
      <Th>{habit.name}</Th>
      {days.map((day) => (
        <Td key={formatDate(day)} textAlign="center" p="0">
          <Checkbox
            value={day.getTime()}
            onChange={updateDays}
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
const listIncludesDay = (list: number[] = [], day: Date) =>
  list.some((d) => isSameDay(d, day))
