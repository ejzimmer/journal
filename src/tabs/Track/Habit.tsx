import { Checkbox } from "@chakra-ui/checkbox"
import { Td, Th } from "@chakra-ui/table"
import { format, isSameDay } from "date-fns"
import { HabitRecord } from "./types"
import { ChangeEvent, ChangeEventHandler, useEffect, useState } from "react"
import { CloseIcon } from "@chakra-ui/icons"
import { Box, IconButton } from "@chakra-ui/react"
import { ConfirmDelete } from "../../shared/ConfirmDelete"

interface Props {
  habit: HabitRecord
  days: Date[]
  onChange: (habit: HabitRecord) => void
  onDelete: (habit: HabitRecord) => void
}

export function Habit({ habit, days, onChange, onDelete }: Props) {
  const [showConfirmation, setShowConfirmation] = useState(false)

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
    <>
      <Th>{habit.name}</Th>
      {[days[0]].map((day) => (
        <Td key={formatDate(day)} textAlign="center" p="0">
          {/* <Checkbox
            value={day.getTime()}
            onChange={updateDays}
            data-aria-label={`${habit.name} ${formatDate(day)}`}
            isChecked={listIncludesDay(habit.days, day)}
          /> */}
          <MultiStateCheckbox name={`${habit.name}-${day.getTime()}`} />
        </Td>
      ))}
      <Td>
        <IconButton
          variant="ghost"
          color="gray.400"
          _hover={{
            color: "red.500",
          }}
          icon={<CloseIcon />}
          aria-label="delete habit"
          onClick={() => setShowConfirmation(true)}
        />
        <ConfirmDelete
          isOpen={showConfirmation}
          onClose={() => setShowConfirmation(false)}
          onDelete={() => onDelete(habit)}
        />{" "}
      </Td>
    </>
  )
}

const formatDate = (date: Date) => format(date, "yyyy-MM-dd")
const listIncludesDay = (list: number[] = [], day: Date) =>
  list.some((d) => isSameDay(d, day))

function MultiStateCheckbox({ name }: { name: string }) {
  const [state, setState] = useState("off")

  const handleClick: ChangeEventHandler<HTMLInputElement> = (event) => {
    setState(event.target.value)
  }

  return (
    <Box
      as="fieldset"
      __css={{
        label: { cursor: "pointer", fontSize: "30px", display: "none" },
        "input:checked + label": { display: "initial" },
        input: { display: "none" },
      }}
    >
      <input
        id={`${name}-yes`}
        type="radio"
        name={name}
        value="yes"
        checked={state === "yes"}
        onChange={handleClick}
      />
      <label htmlFor={`${name}-no`}>✅</label>

      <input
        id={`${name}-no`}
        type="radio"
        name={name}
        value="no"
        checked={state === "no"}
        onChange={handleClick}
      />
      <label htmlFor={`${name}-off`}>❌</label>

      <input
        type="radio"
        id={`${name}-off`}
        name={name}
        value="off"
        checked={state === "off"}
        onChange={handleClick}
      />
      <label htmlFor={`${name}-yes`}>⬜</label>
    </Box>
  )
}
